import React, { useState, useEffect, useMemo } from 'react';
import BaseMonitor from './BaseMonitor';
import { useRestaurant } from '../../context/RestaurantContext';

const ResponseTimeMonitor = () => {
  const { orderHistory } = useRestaurant();
  const [responseTimeData, setResponseTimeData] = useState([]);
  
  useEffect(() => {
    const updateResponseTime = () => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;
      
      // Calculate average response time for every 10 queries
      const recentOrders = orderHistory
        .filter(order => new Date(order.orderTimestamp).getTime() > tenMinutesAgo)
        .sort((a, b) => new Date(a.orderTimestamp) - new Date(b.orderTimestamp));

      const responseTimePoints = [];
      for (let i = 0; i < recentOrders.length; i += 10) {
        const batch = recentOrders.slice(i, i + 10);
        const avgResponseTime = batch.reduce((sum, order) => sum + order.predictionTime, 0) / batch.length;
        
        responseTimePoints.push({
          time: batch[0].orderTimestamp,
          responseTime: avgResponseTime
        });
      }

      setResponseTimeData(responseTimePoints);
    };

    updateResponseTime();
    const interval = setInterval(updateResponseTime, 5000);
    return () => clearInterval(interval);
  }, [orderHistory]);

  const chartData = useMemo(() => ({
    labels: responseTimeData.map(point => new Date(point.time).toLocaleTimeString()),
    datasets: [{
      label: 'Average Response Time (ms)',
      data: responseTimeData.map(point => point.responseTime),
      borderColor: 'rgb(153, 102, 255)',
      tension: 0.1
    }]
  }), [responseTimeData]);

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...responseTimeData.map(point => point.responseTime)) + 10
      }
    },
    animation: false
  };

  return (
    <BaseMonitor
      title="Response Time"
      data={chartData}
      options={options}
    />
  );
};

export default ResponseTimeMonitor;
