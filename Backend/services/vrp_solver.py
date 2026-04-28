from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_vrp(distance_matrix, time_matrix, demands,
              num_vehicles, vehicle_capacities,
              is_mall_list, time_windows,
              base_drop_time, var_drop_time):
    """
    Mesin AI VRP dengan Kapasitas, Jendela Waktu, dan SMART BALANCING.
    """
    data = {}
    data['distance_matrix'] = distance_matrix
    data['time_matrix'] = time_matrix 
    data['demands'] = demands
    data['vehicle_capacities'] = vehicle_capacities
    data['num_vehicles'] = num_vehicles
    data['time_windows'] = time_windows 
    data['depot'] = 0 
    
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)

    # ==========================================
    # 1. DIMENSI JARAK (DISTANCE)
    # ==========================================
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    dimension_name = 'Distance'
    routing.AddDimension(
        transit_callback_index,
        0, 
        300000, 
        True, 
        dimension_name)
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    
    # Denda ini (10) cukup buat memastikan rute ngga ada yang terlalu jauh
    distance_dimension.SetGlobalSpanCostCoefficient(10) 

    # ==========================================
    # 2. DIMENSI KAPASITAS (CAPACITY)
    # ==========================================
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data['demands'][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index, 
        0,  
        data['vehicle_capacities'], 
        True, 
        'Capacity'
    )
    
    # 🌟 OPTIMASI: Dihapus. Jangan maksain AI buat ngebagi muatan SAMA RATA. 
    # Biarin aja AI ngisi truk 1 sampe penuh, baru buka truk 2. Lebih efisien.
    # capacity_dimension = routing.GetDimensionOrDie('Capacity')
    # capacity_dimension.SetGlobalSpanCostCoefficient(5) <-- DIHAPUS

    # ==========================================
    # 3. DIMENSI WAKTU (TIME WINDOWS)
    # ==========================================
    def time_callback(from_index, to_index):
        # 🌟 FIXED: Spasi (Indentation) udah dibenerin! Ngga bakal error lagi.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        travel_time = data['time_matrix'][from_node][to_node]

        if to_node == 0:
            return int(travel_time)

        qty = data['demands'][to_node]

        # 🌟 DINAMIS dari System Settings
        tambahan_waktu_qty = (qty * var_drop_time) / 10.0

        if is_mall_list[to_node]:
            service_time = 60 + tambahan_waktu_qty  # Mall tetap 60 base
        else:
            service_time = base_drop_time + tambahan_waktu_qty

        return int(travel_time + service_time)

    time_callback_index = routing.RegisterTransitCallback(time_callback)
    
    routing.AddDimension(
        time_callback_index,
        60,  
        1200, 
        False, 
        'Time'
    )
    time_dimension = routing.GetDimensionOrDie('Time')

    # Setting Time Windows buat toko-toko
    for location_idx, time_window in enumerate(data['time_windows']):
        if location_idx == data['depot']: continue
        index = manager.NodeToIndex(location_idx)
        time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])

    # Setting Time Windows buat truk (Jam kerja depot)
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0], data['time_windows'][0][1])
        index = routing.End(vehicle_id)
        time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0], data['time_windows'][0][1])

    # Insting AI biar truk beres secepet mungkin
    for i in range(data['num_vehicles']):
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(routing.Start(i)))
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(routing.End(i)))

    # ==========================================
    # 4. STRATEGI KEPUTUSAN & PENALTY
    # ==========================================
    # 🌟 OPTIMASI: Diturunin dari 5000 ke 1000. 
    # Biar AI mikir: "Oke, keluarin truk baru emang mahal, tapi kalo dipaksa 1 truk malah telat/kena Time Window, mending keluarin truk baru aja."
    for i in range(data['num_vehicles']):
        routing.SetFixedCostOfVehicle(1000, i) 

    # Denda Drop (Toko ngga kebagian)
    penalty = 100000 
    for node in range(1, len(data['distance_matrix'])):
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.local_search_metaheuristic = (routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.seconds = 60

    print("OR-Tools: Memulai kalkulasi VRP Smart Balancing...")
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        results = {'routes': [], 'dropped_nodes': []}
        for vehicle_id in range(data['num_vehicles']):
            index = routing.Start(vehicle_id)
            route = []
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                route.append(node_index)
                index = solution.Value(routing.NextVar(index))
            route.append(manager.IndexToNode(index))
            results['routes'].append(route)
            
        for node in range(1, len(data['distance_matrix'])):
            if solution.Value(routing.NextVar(manager.NodeToIndex(node))) == manager.NodeToIndex(node):
                results['dropped_nodes'].append(node)
                
        return results
    else:
        print("OR-Tools: GAGAL MENEMUKAN SOLUSI! Coba cek kapasitas atau Time Windows.")
        return None