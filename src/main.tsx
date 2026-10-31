import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './figma.css';

const mountEl = document.getElementById('container') || document.getElementById('root')!;
ReactDOM.createRoot(mountEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
