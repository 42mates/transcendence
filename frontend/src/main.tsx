import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import './i18n/i18n'; 

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
