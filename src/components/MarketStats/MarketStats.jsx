import React from 'react';
import './MarketStats.css';

function MarketStats({ coins }) {
    const totalMarketCap = coins.reduce((acc, coin) => acc + coin.market_cap, 0);
    const total24hVolume = coins.reduce((acc, coin) => acc + coin.total_volume, 0);
    const totalCoins = coins.length;
    const avgPriceChange = (coins.reduce((acc, coin) => acc + coin.price_change_percentage_24h, 0) / totalCoins).toFixed(2);

    return (
        <div className="stats-card">
            <h3>Market Overview</h3>
            <div className="stats-list">
                <div className="stats-item">
                    <span>Total Market Cap</span>
                    <span>${(totalMarketCap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="stats-item">
                    <span>24h Volume</span>
                    <span>${(total24hVolume / 1e9).toFixed(2)}B</span>
                </div>
                <div className="stats-item">
                    <span>Active Coins</span>
                    <span>{totalCoins}</span>
                </div>
                <div className="stats-item">
                    <span>Avg 24h Change</span>
                    <span className={avgPriceChange > 0 ? 'green' : 'red'}>
                        {avgPriceChange}%
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MarketStats;