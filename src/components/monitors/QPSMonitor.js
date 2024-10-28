import React, { useState, useEffect, useMemo } from 'react';
import BaseMonitor from './BaseMonitor';
import { useRestaurant } from '../../context/RestaurantContext';

const QPSMonitor = () => {
  const { orderHistory } = useRestaurant();
  const [qpsData, setQpsData] = useState([]);
  const MINUTES_TO_SHOW = 5; // Show last 5 minutes
  const INTERVAL_MS = 5000; // 5 seconds
  const MAX_POINTS = (MINUTES_TO_SHOW * 60) / (INTERVAL_MS / 1000); // Number of 5-second slots in 5 minutes
  
  useEffect(() => {
    let interval; // Declare interval variable in the proper scope

    const updateQPS = () => {
      const now = Math.floor(Date.now() / INTERVAL_MS) * INTERVAL_MS; // Round to nearest 5-second interval
      const startTime = now - (MAX_POINTS * INTERVAL_MS);
      
      // Create fixed time slots for each 5-second interval
      const qpsPoints = [];
      for (let t = startTime; t < now; t += INTERVAL_MS) {
        const intervalStart = t;
        const intervalEnd = t + INTERVAL_MS;
        
        const ordersInInterval = orderHistory.filter(order => {
          const orderTime = new Date(order.orderTimestamp).getTime();
          return orderTime >= intervalStart && orderTime < intervalEnd;
        });

        // Calculate QPS as orders per 5 seconds / 5 to get per second rate
        const qps = ordersInInterval.length / 5;
        
        qpsPoints.push({
          intervalStart,
          intervalEnd,
          time: new Date(intervalStart).toISOString(),
          qps: qps,
          orderCount: ordersInInterval.length
        });
      }

      setQpsData(qpsPoints);
    };

    updateQPS();
    
    // Align the interval with the 5-second boundaries
    const nextUpdate = INTERVAL_MS - (Date.now() % INTERVAL_MS);
    const initialTimeout = setTimeout(() => {
      updateQPS();
      // Start the regular interval after the aligned update
      interval = setInterval(updateQPS, INTERVAL_MS);
    }, nextUpdate);

    return () => {
      clearTimeout(initialTimeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderHistory]);

  const chartData = useMemo(() => ({
    labels: qpsData.map(point => {
      const startTime = new Date(point.intervalStart);
      const endTime = new Date(point.intervalEnd);
      return `${startTime.getSeconds().toString().padStart(2, '0')}-${endTime.getSeconds().toString().padStart(2, '0')}`;
    }),
    datasets: [{
      label: 'Queries Per Second',
      data: qpsData.map(point => point.qps.toFixed(2)),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }), [qpsData]);

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...qpsData.map(point => point.qps)) + 0.5
      },
      x: {
        grid: {
          display: true
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Time (seconds)'
        }
      }
    },
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = qpsData[context.dataIndex];
            const startTime = new Date(point.intervalStart);
            return [
              `QPS: ${Number(point.qps).toFixed(2)}`,
              `Orders in 5s: ${point.orderCount}`,
              `Time: ${startTime.toLocaleTimeString()}`
            ];
          }
        }
      }
    }
  };

  return (
    <BaseMonitor
      title="Queries Per Second (5-second intervals)"
      data={chartData}
      options={options}
    />
  );
};

export default QPSMonitor;
