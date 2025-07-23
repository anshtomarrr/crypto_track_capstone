import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/home';
import CoinDetail from './components/CoinDetail/CoinDetail';
import Navbar from './components/Navbar/Navbar';
import { CoinProvider } from './context/CoinContext';
import Portfolio from './components/Portfolio/Portfolio'; 
import ProtectedRoute from './components/ProtectedRoute';
import News from './components/News/News';
import AboutUs from './components/AboutUs/AboutUs';

function App() {
  return (
    <Router>
      <CoinProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coin/:id" element={<CoinDetail />} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/news" element={<News />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </div>
      </CoinProvider>
    </Router>
  );
}

export default App;