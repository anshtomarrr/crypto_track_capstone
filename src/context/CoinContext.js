import React, { createContext, useState, useContext, useEffect } from 'react';

const CoinContext = createContext();

export const CoinProvider = ({ children }) => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
                );
                const data = await response.json();
                setCoins(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching coins:', error);
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    return (
        <CoinContext.Provider value={{ coins, loading }}>
            {children}
        </CoinContext.Provider>
    );
};

export const useCoins = () => {
    const context = useContext(CoinContext);
    if (!context) {
        throw new Error('useCoins must be used within a CoinProvider');
    }
    return context;
};