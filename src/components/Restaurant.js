import React, { useEffect } from 'react';
import './Restaurant.css';
import { useRestaurant } from '../context/RestaurantContext';

const Restaurant = () => {
  const { 
    orderHistory,
    setCurrentPage
  } = useRestaurant();

  useEffect(() => {
    setCurrentPage('restaurant');
  }, [setCurrentPage]);

  return (
    <div className="restaurant">
      <h2>Recent Order History</h2>
      {orderHistory.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="order-list">
          {orderHistory.slice(-10).reverse().map((order) => (
            <div key={order.orderNumber} className="order-card">
              <div className="order-header">
                <span className="order-number">Order #{order.orderNumber}</span>
                <span className="order-time">{new Date(order.orderTimestamp).toLocaleString()}</span>
                <span className={`satisfaction ${order.satisfied ? 'satisfied' : 'unsatisfied'}`}>
                  {order.satisfied ? 'Satisfied' : 'Unsatisfied'}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Order:</strong> {order.order}</p>
                <p><strong>Desired Wine:</strong> {order.desiredWine}</p>
                <p><strong>Predicted Wine:</strong> {order.predictedWine}</p>
                <p><strong>Prediction Time:</strong> {order.predictionTime} ms</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurant;
