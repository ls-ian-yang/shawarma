import React, { useState, useEffect, useMemo } from 'react';
import BaseMonitor from './BaseMonitor';
import { useRestaurant } from '../../context/RestaurantContext';

const AccuracyMonitor = () => {
  const { orderHistory } = useRestaurant();
  const [accuracyData, setAccuracyData] = useState([]);
  const BATCH_SIZE = 5;
  const MAX_POINTS = 10; // Number of points to show on the graph
  
  useEffect(() => {
    const updateAccuracy = () => {
      // Only process if we have enough orders
      if (orderHistory.length < BATCH_SIZE) return;

      // Sort orders by timestamp to ensure correct ordering
      const sortedOrders = [...orderHistory].sort((a, b) => 
        new Date(a.orderTimestamp) - new Date(b.orderTimestamp)
      );

      // Calculate number of complete batches
      const numBatches = Math.floor(sortedOrders.length / BATCH_SIZE);
      const accuracyPoints = [];

      // Process each complete batch
      for (let i = Math.max(0, numBatches - MAX_POINTS); i < numBatches; i++) {
        const batchStart = i * BATCH_SIZE;
        const batch = sortedOrders.slice(batchStart, batchStart + BATCH_SIZE);
        
        const satisfiedCount = batch.filter(order => order.satisfied).length;
        const accuracy = (satisfiedCount / BATCH_SIZE) * 100;

        accuracyPoints.push({
          batchNumber: i + 1,
          time: batch[batch.length - 1].orderTimestamp,
          accuracy,
          orderRange: `${batchStart + 1}-${batchStart + BATCH_SIZE}`
        });
      }

      setAccuracyData(accuracyPoints);
    };

    updateAccuracy();
  }, [orderHistory]);

  const chartData = useMemo(() => ({
    labels: accuracyData.map(point => `Batch ${point.orderRange}`),
    datasets: [{
      label: 'Prediction Accuracy (%)',
      data: accuracyData.map(point => point.accuracy),
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  }), [accuracyData]);

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100
      },
      x: {
        grid: {
          display: true
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = accuracyData[context.dataIndex];
            return [
              `Accuracy: ${point.accuracy.toFixed(1)}%`,
              `Orders: ${point.orderRange}`,
              `Time: ${new Date(point.time).toLocaleTimeString()}`
            ];
          }
        }
      }
    }
  };

  return (
    <BaseMonitor
      title="Prediction Accuracy (By 5-Order Batches)"
      data={chartData}
      options={options}
    />
  );
};

export default AccuracyMonitor;
