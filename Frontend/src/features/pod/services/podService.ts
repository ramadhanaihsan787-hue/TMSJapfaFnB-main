export const podService = {
    approvePod: async (id: string) => {
        console.log("Approving POD:", id);
        return { success: true };
    },
    rejectPod: async (id: string, reason: string) => {
        console.log("Rejecting POD:", id, reason);
        return { success: true };
    }
};