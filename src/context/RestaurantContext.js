import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { saveOrderToCSV, loadOrderHistoryFromCSV } from '../utils/csvUtils';
import Waiter from '../models/Waiter';
import SimpleModel from '../models/SimpleModel';
import ModelRegistry from '../models/ModelRegistry';

export const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [isOperating, setIsOperating] = useState(true);
  const [speedyMode, setSpeedyModeState] = useState(false);
  const [maxCustomers, setMaxCustomersState] = useState(1);
  const [currentPage, setCurrentPage] = useState('restaurant');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderNumber, setOrderNumberState] = useState(1);
  const [waiter] = useState(() => new Waiter(new SimpleModel()));
  const [modelRegistry] = useState(() => new ModelRegistry(waiter));

  // Load metadata from local storage and order history from CSV on initial render
  useEffect(() => {
    const loadedMetadata = JSON.parse(localStorage.getItem('restaurantMetadata')) || {};
    setSpeedyModeState(loadedMetadata.speedyMode || false);
    setMaxCustomersState(loadedMetadata.maxCustomers || 1);
    setOrderNumberState(loadedMetadata.orderNumber || 1);

    loadOrderHistoryFromCSV().then(loadedHistory => {
      setOrderHistory(loadedHistory);
      if (loadedHistory.length > 0) {
        const maxOrderNumber = Math.max(...loadedHistory.map(order => order.orderNumber));
        setOrderNumberState(maxOrderNumber + 1);
      }
    });
  }, []);

  // Save metadata to local storage
  const saveMetadata = useCallback(() => {
    localStorage.setItem('restaurantMetadata', JSON.stringify({
      speedyMode,
      maxCustomers,
      orderNumber,
    }));
  }, [speedyMode, maxCustomers, orderNumber]);

  // Custom setters that save metadata
  const setSpeedyMode = useCallback((value) => {
    setSpeedyModeState(value);
    saveMetadata();
  }, [saveMetadata]);

  const setMaxCustomers = useCallback((value) => {
    setMaxCustomersState(value);
    saveMetadata();
  }, [saveMetadata]);

  const setOrderNumber = useCallback((value) => {
    setOrderNumberState(value);
    saveMetadata();
  }, [saveMetadata]);

  const addOrderToHistory = useCallback((newOrder) => {
    setOrderHistory(prevHistory => {
      const updatedOrder = {
        ...newOrder,
        orderNumber: orderNumber,
        orderTimestamp: new Date().toISOString(),
      };
      const updatedHistory = [...prevHistory, updatedOrder];
      setOrderNumber(prevNumber => prevNumber + 1);
      saveOrderToCSV(updatedOrder);
      return updatedHistory;
    });
  }, [orderNumber, setOrderNumber]);

  const setCurrentPageSafely = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const resetAllData = useCallback(() => {
    setOrderHistory([]);
    setSpeedyModeState(false);
    setMaxCustomersState(1);
    setOrderNumberState(1);
    saveMetadata();
  }, [saveMetadata]);

  const getPreparedData = useCallback(() => {
    const oddOrders = orderHistory.filter(order => order.orderNumber % 2 !== 0);
    return oddOrders.map(order => ({
      orderNumber: order.orderNumber,
      order: order.order,
      desiredWine: order.desiredWine,
      predictedWine: order.predictedWine,
      satisfied: order.satisfied
    }));
  }, [orderHistory]);

  // New function to get a snapshot of the order history
  const getOrderHistorySnapshot = useCallback(() => {
    return [...orderHistory];
  }, [orderHistory]);

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
    setOrderHistory,
    addOrderToHistory,
    orderNumber,
    resetAllData,
    getPreparedData,
    getOrderHistorySnapshot,
    waiter,
    modelRegistry,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
