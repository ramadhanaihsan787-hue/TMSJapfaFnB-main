import { useNavigate } from 'react-router-dom';

export const useDriverappFlow = () => {
    const navigate = useNavigate();

    return {
        startRoute: () => navigate('/driver/routes'),
        viewStopDetail: () => navigate('/driver/detail'),
        arriveAtLocation: () => navigate('/driver/pod'),
        submitPod: () => navigate('/driver/summary'),
        endTrip: () => navigate('/driver'),
        goToHistory: () => navigate('/driver') // Sementara arahin ke dashboard dulu
    };
};