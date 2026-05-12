# services/vrp_solver.py
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import logging

logger = logging.getLogger(__name__)

def solve_vrp(distance_matrix, time_matrix, demands, num_vehicles, vehicle_capacities,
              is_mall_list, time_windows, base_drop_time, var_drop_time):
    """
    Mesin AI VRP GLOBAL (TanPA K-Means!).
    Murni mikirin Jarak, Kapasitas (KG), dan Jam Kerja.
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

    # 1. DIMENSI JARAK
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # NGGA ADA GLOBAL SPAN COST BIAR AI NGGA PELIT JARAK!
    routing.AddDimension(transit_callback_index, 0, 300000, True, 'Distance')

    # 2. DIMENSI KAPASITAS (KG)
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data['demands'][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index, 0, data['vehicle_capacities'], True, 'Capacity'
    )

    # 3. DIMENSI WAKTU & JAM KERJA
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        travel_time = data['time_matrix'][from_node][to_node]

        if to_node == 0:
            return int(travel_time)

        qty = data['demands'][to_node]
        tambahan_waktu_qty = (qty * var_drop_time) / 10.0
        service_time = (60 if is_mall_list[to_node] else base_drop_time) + tambahan_waktu_qty

        return int(travel_time + service_time)

    time_callback_index = routing.RegisterTransitCallback(time_callback)
    
    # KUNCI 1: Maksimal nunggu supir kita bikin panjang (1440 = 24 Jam)
    routing.AddDimension(time_callback_index, 1440, 1440, False, 'Time') 
    time_dimension = routing.GetDimensionOrDie('Time')

    # KUNCI 2: HARD & SOFT TIME WINDOWS (Logika Lembur)
    for location_idx, time_window in enumerate(data['time_windows']):
        if location_idx == data['depot']: continue
            
        index = manager.NodeToIndex(location_idx)
        tw_start, tw_end = time_window # tw_end ini jam 19:30
        
        if is_mall_list[location_idx]:
            # Mall = Strict (Dilarang telat)
            time_dimension.CumulVar(index).SetRange(tw_start, tw_end)
        else:
            # Toko Biasa = Boleh Lembur Maksimal 2 Jam!
            max_overtime_mins = 120
            absolute_deadline = tw_end + max_overtime_mins
            if absolute_deadline > 1440: absolute_deadline = 1440
                
            time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0], absolute_deadline)
            
            # AI bakal kena denda 100 poin per menit kalau maksa lembur (Lewat dari tw_end/19:30)
            penalty_lembur = 100 
            time_dimension.SetCumulVarSoftUpperBound(index, tw_end, penalty_lembur)

    # Depot Start & End constraint
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0], data['time_windows'][0][1])
        index = routing.End(vehicle_id)
        time_dimension.CumulVar(index).SetRange(data['time_windows'][0][0], 1440)
        
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(routing.Start(vehicle_id)))
        routing.AddVariableMinimizedByFinalizer(time_dimension.CumulVar(routing.End(vehicle_id)))

    # KUNCI 3: DENDA BUANG TOKO MAHAL BANGET BIAR AI TAKUT!
    penalty = 500000 
    for node in range(1, len(data['distance_matrix'])):
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION)
    search_parameters.local_search_metaheuristic = (routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.seconds = 30 # Kasih waktu lebih buat mikir global

    logger.info("OR-Tools: Memulai kalkulasi Global VRP...")
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
        logger.error("OR-Tools: GAGAL MENEMUKAN SOLUSI!")
        return None