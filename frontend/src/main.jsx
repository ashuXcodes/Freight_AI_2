import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RootApp from './RootApp.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
