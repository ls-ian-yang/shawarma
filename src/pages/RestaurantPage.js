import React, { useState, useEffect, useCallback, useRef } from 'react';
import UI from '../components/UI';
import CurrentOrder from '../components/CurrentOrder';
import Restaurant from '../components/Restaurant';
import DataCollector from '../models/DataCollector';
import Customer from '../models/Customer';
import { useRestaurant } from '../context/RestaurantContext';
import { useLocation } from 'react-router-dom';

// Constants
const DIALOG_PAUSE = 100; // ms
const MIN_DELAY = 10; // ms

function RestaurantPage() {
  const { 
    orderHistory, 
    addOrderToHistory, 
    speedyMode, 
    setSpeedyMode, 
    maxCustomers, 
    setMaxCustomers,
    isOperating,
    setIsOperating,
    setCurrentPage,
    waiter  // This is now a regular object, not a ref
  } = useRestaurant();

  const [currentInteraction, setCurrentInteraction] = useState({});
  const [orderStage, setOrderStage] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const dataCollector = useRef(new DataCollector());
  const timerRef = useRef(null);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const location = useLocation();

  useEffect(() => {
    setCurrentPage('restaurant');
    setIsOperating(true);

    // Start the restaurant operation
    scheduleNextOrder();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const processOrder = useCallback(async () => {
    if (isProcessing || !isOperating) return;
    setIsProcessing(true);

    // Clear previous interaction only when starting a new one
    setCurrentInteraction({});
    setOrderStage(-1);

    const customer = new Customer();
    const order = customer.generateOrder();
    const desiredWine = customer.getDesiredWine();
    const orderTimestamp = new Date().toISOString();
    
    setOrderStage(0);
    setCurrentInteraction({ order, desiredWine, orderTimestamp });

    if (!speedyMode) await delay(DIALOG_PAUSE);

    setOrderStage(1); // Waiter is thinking

    const startTime = performance.now();
    const predictedWine = await waiter.predictWine(order);  // Remove .current
    const endTime = performance.now();
    const predictionTime = endTime - startTime;

    if (!speedyMode) await delay(DIALOG_PAUSE);

    const satisfied = predictedWine === desiredWine;

    const completedInteraction = { 
      order, 
      desiredWine, 
      predictedWine, 
      predictionTime,
      satisfied,
      orderTimestamp
    };

    setCurrentInteraction(completedInteraction);

    setOrderStage(2); // Prediction made and customer reaction

    if (!speedyMode) await delay(DIALOG_PAUSE);

    setOrderStage(3); // Thank you message

    // Record the interaction and update order history
    addOrderToHistory(completedInteraction);
    dataCollector.current.recordInteraction(completedInteraction);

    if (!speedyMode) await delay(DIALOG_PAUSE);

    setIsProcessing(false);
  }, [speedyMode, isProcessing, addOrderToHistory, isOperating, waiter]);

  const scheduleNextOrder = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (!isOperating) return;

    const delay = speedyMode ? MIN_DELAY : Math.max(1000 / maxCustomers, MIN_DELAY);
    timerRef.current = setTimeout(() => {
      processOrder().then(() => {
        scheduleNextOrder();
      });
    }, delay);
  }, [speedyMode, maxCustomers, processOrder, isOperating]);

  useEffect(() => {
    scheduleNextOrder();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNextOrder, location.pathname]);

  const handleSpeedyModeChange = useCallback((newSpeedyMode) => {
    setSpeedyMode(newSpeedyMode);
    scheduleNextOrder();
  }, [scheduleNextOrder, setSpeedyMode]);

  // Only render the UI when on the home route
  if (location.pathname !== '/') {
    return null;
  }

  return (
    <>
      <h1>Restaurant Simulation</h1>
      <UI 
        maxCustomersPerSecond={maxCustomers} 
        setMaxCustomersPerSecond={setMaxCustomers}
        speedyMode={speedyMode}
        setSpeedyMode={handleSpeedyModeChange}
      />
      <CurrentOrder 
        currentOrder={currentInteraction} 
        orderStage={orderStage}
      />
      <Restaurant />
    </>
  );
}

export default RestaurantPage;
