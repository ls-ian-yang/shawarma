import React, { useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';

const DB = () => {
  const { setCurrentPage, orderHistory } = useRestaurant();

  useEffect(() => {
    setCurrentPage('db');
  }, [setCurrentPage]);

  return (
    <div className="db">
      <h2>All Orders</h2>
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
                <td>{order.order.join(', ')}</td>
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
