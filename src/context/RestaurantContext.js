import React, { createContext, useContext, useState, useCallback } from 'react';

export const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [isOperating, setIsOperating] = useState(true);
  const [speedyMode, setSpeedyMode] = useState(false);
  const [maxCustomers, setMaxCustomers] = useState(1);
  const [currentPage, setCurrentPage] = useState('restaurant');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderNumber, setOrderNumber] = useState(1);

  const addOrderToHistory = useCallback((newOrder) => {
    setOrderHistory(prevHistory => {
      const updatedOrder = { ...newOrder, orderNumber };
      const updatedHistory = [...prevHistory, updatedOrder];
      setOrderNumber(prevNumber => prevNumber + 1);
      return updatedHistory;
    });
  }, [orderNumber]);

  const setCurrentPageSafely = useCallback((page) => {
    setCurrentPage(page);
    // We no longer automatically set isOperating to true here
  }, []);

  const value = {
    isOperating,
    setIsOperating,
    speedyMode,
    setSpeedyMode,
    maxCustomers,
    setMaxCustomers,
    currentPage,
    setCurrentPage: setCurrentPageSafely,
    orderHistory,
    addOrderToHistory,
    orderNumber,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
