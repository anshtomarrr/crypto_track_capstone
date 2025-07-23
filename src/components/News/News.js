import React, { useEffect, useState } from 'react';
import './News.css';

const NEWS_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(NEWS_URL);
        if (!res.ok) throw new Error('Failed to fetch news.');
        const data = await res.json();
        setNews(data.Data || []);
      } catch (e) {
        setError('Could not load news. Please try again later.');
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="news-container">
      <div className="news-inner">
        <h1 className="news-title">Crypto News</h1>
        {loading && <p className="news-loading">Loading news...</p>}
        {error && <p className="news-error">{error}</p>}
        <div className="news-grid">
          {news.map((item, idx) => (
            <div key={idx} className="news-card">
              <div className="news-content">
                {item.imageurl && (
                  <img src={item.imageurl} alt="news" className="news-image" />
                )}
                <div className="news-details">
                  <div>
                    <div className="news-headline">{item.title}</div>
                    <div className="news-source">{item.source_info.name} &bull; {new Date(item.published_on * 1000).toLocaleString()}</div>
                  </div>
                  <div className="news-button-container">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.url, '_blank');
                      }}
                      className="read-more-button"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News; 