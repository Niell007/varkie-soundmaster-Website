import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../components/App';
import '../styles/index.css';

// Mount the React application
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
