import { useState } from 'react';

export const usePod = () => {
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return {
        openActionId,
        setOpenActionId,
        isFilterOpen,
        setIsFilterOpen
    };
};