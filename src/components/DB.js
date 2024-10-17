import React, { useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { exportToCSV, clearAllData } from '../utils/csvUtils';

const DB = () => {
  const { 
    setCurrentPage, 
    orderHistory, 
    resetAllData 
  } = useRestaurant();

  useEffect(() => {
    setCurrentPage('db');
  }, [setCurrentPage]);

  const handleExport = () => {
    exportToCSV(orderHistory, 'order_history.csv');
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      resetAllData();
    }
  };

  return (
    <div className="db">
      <h2>All Orders</h2>
      <div>
        <button onClick={handleExport}>Export to CSV</button>
        <button onClick={handleClearCache} style={{marginLeft: '10px'}}>Clear All Data</button>
      </div>
      {orderHistory && orderHistory.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Time</th>
              <th>Order</th>
              <th>Desired Wine</th>
              <th>Predicted Wine</th>
              <th>Satisfied</th>
            </tr>
          </thead>
          <tbody>
            {[...orderHistory].reverse().map((order) => (
              <tr key={order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>{new Date(order.orderTimestamp).toLocaleString()}</td>
                <td>{Array.isArray(order.order) ? order.order.join(', ') : order.order}</td>
                <td>{order.desiredWine}</td>
                <td>{order.predictedWine}</td>
                <td>{order.satisfied ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
};

export default DB;
