
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary for better error handling
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Add global error handler
const originalConsoleError = console.error;
console.error = (...args) => {
  // Log the error with extra context
  originalConsoleError('Caught error:', ...args);
  return originalConsoleError.apply(console, args);
};

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
