import React, { useState } from "react";
import "./home.css";
import TopGainers from "../TopGainers/TopGainers";
import TopLosers from "../TopLosers/TopLosers";
import MarketStats from "../MarketStats/MarketStats";
import { useNavigate } from 'react-router-dom';
import { useCoins } from '../../context/CoinContext';

function Home() {
    const { coins, loading } = useCoins();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <h2>Loading coins</h2>
    }

    return(
        <div className="container">
            <div className="stats-grid">
                <TopGainers coins={coins} />
                <TopLosers coins={coins} />
                <MarketStats coins={coins} />
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by coin name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <table className="crypto-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Coin</th>
                        <th>Price</th>
                        <th>24h Change</th>
                        <th>Market Cap</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCoins.map((icoin,index)=>{
                        return(
                            <tr 
                                key={icoin.id} 
                                onClick={() => navigate(`/coin/${icoin.id}`)}
                                className="clickable-row"
                            >
                                <td className="coin-cell">
                                    <img 
                                        src={icoin.image}
                                        alt={icoin.name}
                                        width="25"
                                        style={{ verticalAlign: "middle", marginRight: "10px" }}
                                    />
                                    {index+1}
                                </td>
                                <td className="coin-name">{icoin.name}</td>
                                <td>${icoin.current_price.toLocaleString()}</td>
                                <td
                                className={icoin.price_change_percentage_24h > 0 ? "green" : "red"}>
                                    {icoin.price_change_percentage_24h.toFixed(2)}%
                                </td>
                                <td>${icoin.market_cap.toLocaleString()}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default Home;