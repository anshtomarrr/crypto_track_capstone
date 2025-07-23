import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PrivyProvider } from '@privy-io/react-auth';
const PRIVY_APP_ID = "cmdcptu0f0238l70nvocm3oa8";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PrivyProvider appId={PRIVY_APP_ID}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </PrivyProvider>
);
