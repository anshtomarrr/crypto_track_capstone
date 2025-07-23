import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Select from "react-select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./Portfolio.css";

const COINGECKO_LIST_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false";

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const Portfolio = () => {
  const { authenticated, login, ready, isLoading } = usePrivy();
  const [showModal, setShowModal] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [coinOptions, setCoinOptions] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [editIdx, setEditIdx] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [chartRange, setChartRange] = useState("ALL");

  useEffect(() => {
    async function fetchCoins() {
      setLoadingCoins(true);
      try {
        const res = await fetch(COINGECKO_LIST_URL);
        const data = await res.json();
        const options = data.map((coin) => ({
          value: coin.id,
          label: `${coin.symbol.toUpperCase()} - ${coin.name}`,
          image: coin.image,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
        }));
        setCoinOptions(options);
      } catch (e) {
        setCoinOptions([]);
      }
      setLoadingCoins(false);
    }
    fetchCoins();
  }, []);

  useEffect(() => {
    if (selectedCoin && selectedCoin.current_price) {
      setPrice(selectedCoin.current_price);
    } else {
      setPrice("");
    }
  }, [selectedCoin]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!selectedCoin || !price || !quantity || isNaN(price) || isNaN(quantity))
      return;
    const newTx = {
      coin: selectedCoin,
      purchase_price: parseFloat(price),
      quantity: parseFloat(quantity),
      date,
      notes,
    };
    if (editIdx !== null) {
      setPortfolio(portfolio.map((tx, idx) => (idx === editIdx ? newTx : tx)));
      setEditIdx(null);
    } else {
      setPortfolio([...portfolio, newTx]);
    }
    setSelectedCoin(null);
    setPrice("");
    setQuantity("");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setShowModal(false);
  };

  const handleDelete = (idx) => {
    setPortfolio(portfolio.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx) => {
    const tx = portfolio[idx];
    setSelectedCoin(tx.coin);
    setPrice(tx.purchase_price);
    setQuantity(tx.quantity);
    setDate(tx.date);
    setNotes(tx.notes);
    setEditIdx(idx);
    setShowModal(true);
  };

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "coin":
        aVal = a.coin.symbol;
        bVal = b.coin.symbol;
        break;
      case "profit":
        aVal =
          a.coin.current_price * a.quantity - a.purchase_price * a.quantity;
        bVal =
          b.coin.current_price * b.quantity - b.purchase_price * b.quantity;
        break;
      case "change":
        aVal = a.coin.price_change_percentage_24h;
        bVal = b.coin.price_change_percentage_24h;
        break;
      case "value":
        aVal = a.coin.current_price * a.quantity;
        bVal = b.coin.current_price * b.quantity;
        break;
      case "date":
      default:
        aVal = a.date;
        bVal = b.date;
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const chartDataAll = sortedPortfolio
    .reduce((acc, tx) => {
      const d = tx.date;
      const value = tx.coin.current_price * tx.quantity;
      const found = acc.find((item) => item.date === d);
      if (found) {
        found.value += value;
      } else {
        acc.push({ date: d, value });
      }
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));

  let chartData = chartDataAll;
  if (chartRange !== "ALL" && chartDataAll.length > 0) {
    let fromDate;
    if (chartRange === "1W") fromDate = getDateDaysAgo(7);
    else if (chartRange === "1M") fromDate = getDateDaysAgo(30);
    else if (chartRange === "3M") fromDate = getDateDaysAgo(90);
    else if (chartRange === "1Y") fromDate = getDateDaysAgo(365);
    chartData = chartDataAll.filter((d) => d.date >= fromDate);
  }

  const formatOptionLabel = (option) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src={option.image}
        alt={option.label}
        style={{ width: 22, height: 22, borderRadius: "50%" }}
      />
      <span>{option.label}</span>
    </div>
  );

  if (!ready || isLoading) {
    return null;
  }

  if (!authenticated) {
    return (
      <div
        style={{
          maxWidth: 420,
          margin: "4rem auto",
          padding: 32,
          background: "rgba(20,20,35,0.85)",
          borderRadius: 18,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#8a8af0" }}>
          Track Your Crypto Portfolio
        </h2>
        <p style={{ color: "#e1e1e6", marginBottom: 28 }}>
          Sign up or log in to add coins and track your portfolio just like
          CoinMarketCap.
        </p>
        <button
          onClick={login}
          style={{
            padding: "10px 32px",
            borderRadius: 10,
            background: "#3b82f6",
            color: "#fff",
            border: "1.5px solid #3b82f6",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px #3b82f610",
            transition:
              "background 0.3s cubic-bezier(.4,0,.2,1), color 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#60a5fa";
            e.currentTarget.style.borderColor = "#60a5fa";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#3b82f6";
            e.currentTarget.style.borderColor = "#3b82f6";
          }}
        >
          Sign Up / Log In
        </button>
      </div>
    );
  }

  const { totalValue } = portfolio.reduce(
    (acc, item) => {
      const currentValue = item.coin.current_price * item.quantity;
      acc.totalValue += currentValue;
      return acc;
    },
    { totalValue: 0 }
  );

  const sortHeader = (label, key) => (
    <span
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => {
        if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else {
          setSortBy(key);
          setSortDir("desc");
        }
      }}
    >
      {label} {sortBy === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </span>
  );

  const chartRanges = [
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "1Y", value: "1Y" },
    { label: "All", value: "ALL" },
  ];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "2rem auto",
        padding: 0,
        background: "none",
      }}
    >
      {/* Total Balance Display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            textAlign: "right",
            background: "#fff",
            borderRadius: 12,
            padding: "18px 32px",
            boxShadow: "0 2px 8px #3b82f610",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>
            Total Balance
          </span>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#3b82f6",
              marginTop: 4,
            }}
          >
            $
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
      {/* Portfolio Value Chart with Time Range Buttons */}
      {chartData.length > 0 && (
        <div
          style={{
            background: "rgba(30,30,50,0.7)",
            borderRadius: 12,
            marginBottom: 32,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {chartRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => setChartRange(r.value)}
                style={{
                  background:
                    chartRange === r.value ? "#8a8af0" : "rgba(20,20,35,0.7)",
                  color: chartRange === r.value ? "#fff" : "#8a8af0",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 18px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 15,
                  transition: "background 0.2s, transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#a3a3f7")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    chartRange === r.value ? "#8a8af0" : "rgba(20,20,35,0.7)")
                }
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.96)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {r.label}
              </button>
            ))}
          </div>
          <h3 style={{ color: "#8a8af0", marginBottom: 16 }}>
            Portfolio Value Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={chartData}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#232336" />
              <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
              <YAxis
                stroke="#aaa"
                fontSize={12}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(v) => `$${v.toLocaleString()}`}
                labelStyle={{ color: "#8a8af0" }}
                contentStyle={{
                  background: "#18182a",
                  border: "none",
                  borderRadius: 8,
                  color: "#e1e1e6",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8a8af0"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state or portfolio table */}
      {portfolio.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <h2 style={{ color: "#222", fontWeight: 700, marginBottom: 8 }}>
            This portfolio needs some final touches…
          </h2>
          <p style={{ color: "#444", marginBottom: 32 }}>
            Add a coin to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "1.5px solid #3b82f6",
              borderRadius: 10,
              padding: "12px 32px",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px #3b82f610",
              transition:
                "background 0.3s cubic-bezier(.4,0,.2,1), color 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1), transform 0.2s",
              transform: "scale(1)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#60a5fa";
              e.currentTarget.style.borderColor = "#60a5fa";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            + Add Coin
          </button>
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "rgba(30,30,50,0.7)",
            borderRadius: 12,
            marginTop: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}
        >
          <thead>
            <tr style={{ color: "#8a8af0", fontWeight: 600 }}>
              <th style={{ padding: 12, textAlign: "left" }}>
                {sortHeader("Coin", "coin")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("Buy Price", "buy")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("Current Price", "value")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("24h Change", "change")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("Quantity", "qty")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("Total Value", "value")}
              </th>
              <th style={{ padding: 12, textAlign: "right" }}>
                {sortHeader("Profit/Loss", "profit")}
              </th>
              <th style={{ padding: 12, textAlign: "left" }}>
                {sortHeader("Date", "date")}
              </th>
              <th style={{ padding: 12, textAlign: "left" }}>Notes</th>
              <th style={{ padding: 12, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPortfolio.map((item, idx) => {
              const currentValue = item.coin.current_price * item.quantity;
              const profitOrLoss =
                currentValue - item.purchase_price * item.quantity;
              const isProfit = profitOrLoss >= 0;
              const is24hUp = item.coin.price_change_percentage_24h >= 0;

              return (
                <tr
                  key={idx}
                  style={{
                    color: "#e1e1e6",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(138,138,240,0.07)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 600,
                    }}
                  >
                    <img
                      src={item.coin.image}
                      alt={item.coin.name}
                      style={{ width: 22, height: 22, borderRadius: "50%" }}
                    />
                    {item.coin.symbol}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    ${item.purchase_price.toLocaleString()}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    ${item.coin.current_price.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "right",
                      color: is24hUp ? "#4cd787" : "#ff5c75",
                    }}
                  >
                    {item.coin.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    ${currentValue.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "right",
                      color: isProfit ? "#4cd787" : "#ff5c75",
                    }}
                  >
                    $
                    {profitOrLoss.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ padding: 12 }}>{item.date}</td>
                  <td
                    style={{
                      padding: 12,
                      maxWidth: 100,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.notes}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8a8af0",
                        fontWeight: 700,
                        fontSize: 18,
                        cursor: "pointer",
                        marginRight: 8,
                        transition: "color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#8a8af0")
                      }
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff5c75",
                        fontWeight: 700,
                        fontSize: 18,
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#ff5c75")
                      }
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Add/Edit Transaction Modal/Card */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10,10,20,0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 36,
              minWidth: 350,
              maxWidth: 400,
              boxShadow: "0 8px 32px #3b82f622",
              position: "relative",
              border: "1.5px solid #dbeafe",
            }}
          >
            <button
              onClick={() => {
                setShowModal(false);
                setEditIdx(null);
              }}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "none",
                border: "none",
                color: "#888",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2
              style={{
                color: "#3b82f6",
                fontWeight: 700,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              {editIdx !== null ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <form onSubmit={handleAddTransaction}>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    color: "#3b82f6",
                    fontWeight: 500,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Coin
                </label>
                <Select
                  options={coinOptions}
                  value={selectedCoin}
                  onChange={setSelectedCoin}
                  isLoading={loadingCoins}
                  formatOptionLabel={formatOptionLabel}
                  placeholder="Search & select a coin..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      background: "#fff",
                      borderColor: "#3b82f6",
                      color: "#222",
                      borderRadius: 8,
                      minHeight: 40,
                    }),
                    menu: (base) => ({
                      ...base,
                      background: "#fff",
                      color: "#222",
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isFocused ? "#e0e7ef" : "#fff",
                      color: "#222",
                    }),
                    singleValue: (base) => ({ ...base, color: "#222" }),
                    placeholder: (base) => ({ ...base, color: "#888" }),
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      color: "#3b82f6",
                      fontWeight: 500,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #3b82f6",
                      background: "#f5f6fa",
                      color: "#222",
                      fontWeight: 500,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      color: "#3b82f6",
                      fontWeight: 500,
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Price Per Coin
                  </label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #3b82f6",
                      background: "#f5f6fa",
                      color: "#222",
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    color: "#3b82f6",
                    fontWeight: 500,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #3b82f6",
                    background: "#f5f6fa",
                    color: "#222",
                    fontWeight: 500,
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    color: "#3b82f6",
                    fontWeight: 500,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes (optional)"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #3b82f6",
                    background: "#f5f6fa",
                    color: "#222",
                    fontWeight: 500,
                    resize: "vertical",
                  }}
                />
              </div>
              <div
                style={{
                  color: "#3b82f6",
                  fontWeight: 600,
                  marginBottom: 18,
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                Total Spent: $
                {quantity && price
                  ? (parseFloat(quantity) * parseFloat(price)).toLocaleString()
                  : 0}
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "1.5px solid #3b82f6",
                  borderRadius: 10,
                  padding: "12px 0",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: selectedCoin ? "pointer" : "not-allowed",
                  opacity: selectedCoin ? 1 : 0.6,
                  transition:
                    "background 0.3s cubic-bezier(.4,0,.2,1), color 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s cubic-bezier(.4,0,.2,1), transform 0.2s",
                }}
                onMouseOver={(e) => {
                  if (selectedCoin) {
                    e.currentTarget.style.background = "#60a5fa";
                    e.currentTarget.style.borderColor = "#60a5fa";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#3b82f6";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.96)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                disabled={!selectedCoin}
              >
                {editIdx !== null ? "Save Changes" : "Add Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
