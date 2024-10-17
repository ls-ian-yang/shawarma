import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { saveOrderHistoryToCSV, loadOrderHistoryFromCSV } from '../utils/csvUtils';

export const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [isOperating, setIsOperating] = useState(true);
  const [speedyMode, setSpeedyModeState] = useState(false);
  const [maxCustomers, setMaxCustomersState] = useState(1);
  const [currentPage, setCurrentPage] = useState('restaurant');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderNumber, setOrderNumberState] = useState(1);

  // Load metadata from local storage and order history from CSV on initial render
  useEffect(() => {
    const loadedMetadata = JSON.parse(localStorage.getItem('restaurantMetadata')) || {};
    setSpeedyModeState(loadedMetadata.speedyMode || false);
    setMaxCustomersState(loadedMetadata.maxCustomers || 1);
    setOrderNumberState(loadedMetadata.orderNumber || 1);

    loadOrderHistoryFromCSV().then(loadedHistory => {
      setOrderHistory(loadedHistory);
    });
  }, []);

  // Save metadata to local storage
  const saveMetadata = useCallback(() => {
    const metadataToSave = {
      speedyMode,
      maxCustomers,
      orderNumber,
    };
    localStorage.setItem('restaurantMetadata', JSON.stringify(metadataToSave));
  }, [speedyMode, maxCustomers, orderNumber]);

  // Custom setters that save metadata
  const setSpeedyMode = useCallback((value) => {
    setSpeedyModeState(value);
    localStorage.setItem('restaurantMetadata', JSON.stringify({
      speedyMode: value,
      maxCustomers,
      orderNumber,
    }));
  }, [maxCustomers, orderNumber]);

  const setMaxCustomers = useCallback((value) => {
    setMaxCustomersState(value);
    localStorage.setItem('restaurantMetadata', JSON.stringify({
      speedyMode,
      maxCustomers: value,
      orderNumber,
    }));
  }, [speedyMode, orderNumber]);

  const setOrderNumber = useCallback((value) => {
    setOrderNumberState(value);
    localStorage.setItem('restaurantMetadata', JSON.stringify({
      speedyMode,
      maxCustomers,
      orderNumber: value,
    }));
  }, [speedyMode, maxCustomers]);

  // Save order history to CSV whenever it changes
  useEffect(() => {
    saveOrderHistoryToCSV(orderHistory);
  }, [orderHistory]);

  const addOrderToHistory = useCallback((newOrder) => {
    setOrderHistory(prevHistory => {
      const updatedOrder = { ...newOrder, orderNumber };
      const updatedHistory = [...prevHistory, updatedOrder];
      setOrderNumber(prevNumber => prevNumber + 1);
      return updatedHistory;
    });
  }, [orderNumber, setOrderNumber]);

  const setCurrentPageSafely = useCallback((page) => {
    setCurrentPage(page);
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
