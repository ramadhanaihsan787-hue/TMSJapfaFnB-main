import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DateRangeContextType {
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
    // Default kalender: Nampilin data 7 hari terakhir sampai hari ini
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <DateRangeContext.Provider value={{ 
            startDate, endDate, setStartDate, setEndDate, isLoading, setIsLoading 
        }}>
            {children}
        </DateRangeContext.Provider>
    );
}

export function useDateRange() {
    const context = useContext(DateRangeContext);
    if (context === undefined) {
        throw new Error('useDateRange must be used within a DateRangeProvider');
    }
    return context;
}