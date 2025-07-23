import React from 'react';
import './TopGainers.css';

function TopGainers({ coins }) {
    const topGainers = [...coins]
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5);

    return (
        <div className="stats-card">
            <h3>Top Gainers (24h)</h3>
            <div className="stats-list">
                {topGainers.map((coin) => (
                    <div key={coin.id} className="stats-item">
                        <img src={coin.image} alt={coin.name} width="20" />
                        <span>{coin.symbol.toUpperCase()}</span>
                        <span className="green">+{coin.price_change_percentage_24h.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopGainers;