import React from 'react';

const UI = ({ maxCustomersPerSecond, setMaxCustomersPerSecond, speedyMode, setSpeedyMode }) => {
  return (
    <div className="ui-controls">
      <div>
        <label htmlFor="maxCustomers">Max Customers per Second: </label>
        <input
          id="maxCustomers"
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={maxCustomersPerSecond}
          onChange={(e) => setMaxCustomersPerSecond(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="speedyMode">Speedy Mode: </label>
        <input
          id="speedyMode"
          type="checkbox"
          checked={speedyMode}
          onChange={(e) => setSpeedyMode(e.target.checked)}
        />
      </div>
    </div>
  );
};

export default UI;
