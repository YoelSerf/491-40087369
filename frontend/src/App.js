// frontend/src/App.js
import React from 'react';
import ComparisonPage from './ComparisonPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Use a simple div with the new title class */}
      <div className="app-title">
        <h1>gRPC vs. GraphQL Performance Dashboard</h1>
      </div>
      <main>
        <ComparisonPage />
      </main>
    </div>
  );
}

export default App;