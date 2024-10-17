import React from 'react';
import './CurrentOrder.css'; // We'll create this file for styling

const LoadingSpinner = () => (
  <span className="loading-spinner"></span>
);

const CurrentOrder = ({ currentOrder, orderStage }) => {
  const { order, predictedWine, desiredWine, satisfied, predictionTime } = currentOrder;

  const renderChatBubble = (content, isCustomer) => (
    <div className={`chat-bubble ${isCustomer ? 'customer' : 'waiter'}`}>
      {content}
    </div>
  );

  return (
    <div className="current-order">
      <h2>Current Interaction</h2>
      <div className="chat-container">
        <div className="customer-avatar">Customer</div>
        <div className="chat-messages">
          {orderStage >= 0 && renderChatBubble(order ? `Order: ${order.join(', ')}` : '', true)}
          {orderStage >= 1 && renderChatBubble(
            <>
              {!predictedWine && (
                <>
                  Thinking <LoadingSpinner />
                </>
              )}
              {predictedWine && (
                <>
                  Recommended wine: {predictedWine}
                  <br />Prediction time: {predictionTime.toFixed(2)} ms
                </>
              )}
            </>,
            false
          )}
          {orderStage >= 2 && renderChatBubble(
            desiredWine ? `My preferred wine was: ${desiredWine}\n${satisfied ? "I'm satisfied!" : "I'm not satisfied."}` : '',
            true
          )}
          {orderStage === 3 && renderChatBubble("Thank you for your visit!", false)}
        </div>
        <div className="waiter-avatar">Waiter</div>
      </div>
    </div>
  );
};

export default CurrentOrder;
