import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import './CoinDetail.css';

const CoinDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coin, setCoin] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [timeframe, setTimeframe] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [cryptoAmount, setCryptoAmount] = useState('1');
    const [usdAmount, setUsdAmount] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coinResponse, chartResponse] = await Promise.all([
                    fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`),
                    fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365}`)
                ]);

                const coinData = await coinResponse.json();
                const chartData = await chartResponse.json();

                setCoin(coinData);
                setChartData(chartData.prices.map(price => ({
                    date: new Date(price[0]).toLocaleString(),
                    price: price[1]
                })));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id, timeframe]);

    const handleCryptoChange = (value) => {
        setCryptoAmount(value);
        if (value && !isNaN(value) && coin) {
            setUsdAmount((parseFloat(value) * coin.market_data.current_price.usd).toFixed(2));
        } else {
            setUsdAmount('');
        }
    };

    const handleUsdChange = (value) => {
        setUsdAmount(value);
        if (value && !isNaN(value) && coin) {
            setCryptoAmount((parseFloat(value) / coin.market_data.current_price.usd).toFixed(8));
        } else {
            setCryptoAmount('');
        }
    };

    const isPositiveChange = coin?.market_data?.price_change_percentage_24h > 0;
    const lineColor = isPositiveChange ? "#4cd787" : "#ff5c75";
    const gradientColor = isPositiveChange ? "#4cd787" : "#ff5c75";

    if (loading || !coin) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading {id} data...</p>
            </div>
        );
    }

    return (
        <div className="coin-detail-container">
            <button 
                onClick={() => navigate(-1)} 
                className="back-button"
            >
                ← Back
            </button>
            
            <div className="coin-header">
                <div className="coin-title">
                    <img src={coin.image.large} alt={coin.name} />
                    <div>
                        <h1>{coin.name} ({coin.symbol.toUpperCase()})</h1>
                        <p className="coin-rank">Rank #{coin.market_cap_rank}</p>
                    </div>
                </div>
                <div className="coin-price-container">
                    <div className="current-price">
                        <h2>${coin.market_data.current_price.usd.toLocaleString()}</h2>
                        <span className={coin.market_data.price_change_percentage_24h > 0 ? 'positive' : 'negative'}>
                            {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="converter-section">
                <div className="converter-card">
                    <h3>Currency Converter</h3>
                    <div className="converter-grid">
                        <div className="converter-input">
                            <label>{coin.symbol.toUpperCase()}</label>
                            <input
                                type="number"
                                value={cryptoAmount}
                                onChange={(e) => handleCryptoChange(e.target.value)}
                                placeholder={`Enter ${coin.symbol.toUpperCase()} amount`}
                            />
                        </div>
                        <div className="converter-equals">=</div>
                        <div className="converter-input">
                            <label>USD</label>
                            <input
                                type="number"
                                value={usdAmount}
                                onChange={(e) => handleUsdChange(e.target.value)}
                                placeholder="Enter USD amount"
                            />
                        </div>
                    </div>
                    <p className="converter-rate">
                        1 {coin.symbol.toUpperCase()} = ${coin.market_data.current_price.usd.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-header">
                    <h3>Price Chart</h3>
                    <div className="timeframe-selector">
                        {['24h', '7d', '30d', '1y'].map(time => (
                            <button 
                                key={time}
                                className={timeframe === time ? 'active' : ''}
                                onClick={() => setTimeframe(time)}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => {
                                if (timeframe === '24h') return new Date(date).toLocaleTimeString();
                                return new Date(date).toLocaleDateString();
                            }}
                            stroke="#8a8af0"
                            tick={{ fill: '#e1e1e6' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                            stroke="#8a8af0"
                            tick={{ fill: '#e1e1e6' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                        />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="custom-tooltip">
                                            <p className="date">{payload[0].payload.date}</p>
                                            <p className="price">${payload[0].value.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={lineColor}
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="coin-stats-grid">
                <div className="stat-card">
                    <h4>Market Cap</h4>
                    <p>${coin.market_data.market_cap.usd.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h4>24h Volume</h4>
                    <p>${coin.market_data.total_volume.usd.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h4>Circulating Supply</h4>
                    <p>{coin.market_data.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</p>
                </div>
                <div className="stat-card">
                    <h4>Total Supply</h4>
                    <p>{coin.market_data.total_supply ? coin.market_data.total_supply.toLocaleString() : 'N/A'} {coin.symbol.toUpperCase()}</p>
                </div>
            </div>

            <div className="coin-info-section">
                <div className="coin-description">
                    <h3>About {coin.name}</h3>
                    <div dangerouslySetInnerHTML={{ __html: coin.description.en }} />
                </div>
                
                <div className="additional-info">
                    <h3>Additional Information</h3>
                    <div className="info-grid">
                        <div>
                            <h4>Official Links</h4>
                            <ul>
                                {coin.links?.homepage?.[0] && (
                                    <li><a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer">Website</a></li>
                                )}
                                {coin.links?.blockchain_site?.filter(Boolean)[0] && (
                                    <li><a href={coin.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">Explorer</a></li>
                                )}
                                {coin.links?.official_forum_url?.filter(Boolean)[0] && (
                                    <li><a href={coin.links.official_forum_url[0]} target="_blank" rel="noopener noreferrer">Forum</a></li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h4>Social Media</h4>
                            <ul>
                                {coin.links?.twitter_screen_name && (
                                    <li><a href={`https://twitter.com/${coin.links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer">Twitter</a></li>
                                )}
                                {coin.links?.subreddit_url && (
                                    <li><a href={coin.links.subreddit_url} target="_blank" rel="noopener noreferrer">Reddit</a></li>
                                )}
                                {coin.links?.telegram_channel_identifier && (
                                    <li><a href={`https://t.me/${coin.links.telegram_channel_identifier}`} target="_blank" rel="noopener noreferrer">Telegram</a></li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinDetail;