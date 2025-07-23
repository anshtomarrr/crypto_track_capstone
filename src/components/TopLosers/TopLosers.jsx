import React from 'react';
import './TopLosers.css';

function TopLosers({ coins }) {
    const topLosers = [...coins]
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 5);

    return (
        <div className="stats-card">
            <h3>Top Losers (24h)</h3>
            <div className="stats-list">
                {topLosers.map((coin) => (
                    <div key={coin.id} className="stats-item">
                        <img src={coin.image} alt={coin.name} width="20" />
                        <span>{coin.symbol.toUpperCase()}</span>
                        <span className="red">{coin.price_change_percentage_24h.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopLosers;