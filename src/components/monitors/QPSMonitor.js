import React, { useState, useEffect, useMemo } from 'react';
import { BaseMonitor, MonitorBase } from './BaseMonitor';
import { useRestaurant } from '../../context/RestaurantContext';

class QPSMonitorLogic extends MonitorBase {
  constructor() {
    super('Queries Per Second (5-second intervals)', 'QPS', 'rgb(75, 192, 192)');
    this.INTERVAL_MS = 5000; // 5 seconds
    this.MINUTES_TO_SHOW = 5; // Show last 5 minutes
    this.MAX_POINTS = (this.MINUTES_TO_SHOW * 60) / (this.INTERVAL_MS / 1000);
  }

  getLabels(data) {
    return data.map(point => {
      const startTime = new Date(point.intervalStart);
      const endTime = new Date(point.intervalEnd);
      return `${startTime.getSeconds().toString().padStart(2, '0')}-${endTime.getSeconds().toString().padStart(2, '0')}`;
    });
  }

  getData(data) {
    return data.map(point => point.qps.toFixed(2));
  }

  getYAxisMax(data) {
    return Math.max(...data.map(point => point.qps), 0) + 0.5;
  }

  getTooltipLabels(point) {
    if (!point) return [];
    return [
      `QPS: ${Number(point.qps).toFixed(2)}`,
      `Orders in 5s: ${point.orderCount}`,
      `Time: ${new Date(point.intervalStart).toLocaleTimeString()}`
    ];
  }
}

const QPSMonitor = () => {
  const { orderHistory } = useRestaurant();
  const [qpsData, setQpsData] = useState([]);
  const monitor = useMemo(() => new QPSMonitorLogic(), []);
  
  useEffect(() => {
    let interval;

    const updateQPS = () => {
      const now = Math.floor(Date.now() / monitor.INTERVAL_MS) * monitor.INTERVAL_MS;
      const startTime = now - (monitor.MAX_POINTS * monitor.INTERVAL_MS);
      
      const qpsPoints = [];
      for (let t = startTime; t <= now; t += monitor.INTERVAL_MS) {
        const intervalStart = t;
        const intervalEnd = t + monitor.INTERVAL_MS;
        
        const ordersInInterval = orderHistory.filter(order => {
          const orderTime = new Date(order.orderTimestamp).getTime();
          return orderTime >= intervalStart && orderTime < intervalEnd;
        });

        const qps = ordersInInterval.length / (monitor.INTERVAL_MS / 1000);
        
        qpsPoints.push({
          intervalStart,
          intervalEnd,
          time: new Date(intervalStart).toISOString(),
          qps,
          orderCount: ordersInInterval.length
        });
      }

      setQpsData(qpsPoints);
    };

    updateQPS();
    
    // Align the interval with the boundaries
    const nextUpdate = monitor.INTERVAL_MS - (Date.now() % monitor.INTERVAL_MS);
    const initialTimeout = setTimeout(() => {
      updateQPS();
      interval = setInterval(updateQPS, monitor.INTERVAL_MS);
    }, nextUpdate);

    return () => {
      clearTimeout(initialTimeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderHistory, monitor]); // Added monitor to dependencies

  return (
    <BaseMonitor
      title={monitor.title}
      data={monitor.createChartData(qpsData)}
      options={monitor.createOptions(qpsData)}
    />
  );
};

export default QPSMonitor;
