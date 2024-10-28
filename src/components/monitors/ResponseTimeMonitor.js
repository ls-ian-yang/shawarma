import React, { useState, useEffect, useMemo } from 'react';
import { BaseMonitor, MonitorBase } from './BaseMonitor';
import { useRestaurant } from '../../context/RestaurantContext';

class ResponseTimeMonitorLogic extends MonitorBase {
  constructor() {
    super('Average Response Time (By 5-Order Batches)', 'Response Time (ms)', 'rgb(153, 102, 255)');
    this.BATCH_SIZE = 5;
  }

  getLabels(data) {
    return data.map(point => `Batch ${point.orderRange}`);
  }

  getData(data) {
    return data.map(point => point.avgResponseTime.toFixed(2));
  }

  getYAxisMax(data) {
    return Math.max(...data.map(point => point.avgResponseTime)) + 10;
  }

  getTooltipLabels(point) {
    if (!point) return [];
    return [
      `Avg Response Time: ${point.avgResponseTime.toFixed(2)} ms`,
      `Orders: ${point.orderRange}`,
      `Time: ${new Date(point.time).toLocaleTimeString()}`
    ];
  }
}

const ResponseTimeMonitor = () => {
  const { orderHistory } = useRestaurant();
  const [responseTimeData, setResponseTimeData] = useState([]);
  const monitor = useMemo(() => new ResponseTimeMonitorLogic(), []);
  
  useEffect(() => {
    const updateResponseTime = () => {
      // Only process if we have enough orders
      if (!orderHistory || orderHistory.length < monitor.BATCH_SIZE) {
        setResponseTimeData([]);
        return;
      }

      // Sort orders by timestamp to ensure correct ordering
      const sortedOrders = [...orderHistory].sort((a, b) => 
        new Date(a.orderTimestamp) - new Date(b.orderTimestamp)
      );

      // Calculate number of complete batches
      const numBatches = Math.floor(sortedOrders.length / monitor.BATCH_SIZE);
      const responseTimePoints = [];

      // Process each complete batch
      for (let i = Math.max(0, numBatches - 30); i < numBatches; i++) {
        const batchStart = i * monitor.BATCH_SIZE;
        const batch = sortedOrders.slice(batchStart, batchStart + monitor.BATCH_SIZE);
        
        if (batch.every(order => order && typeof order.predictionTime === 'number')) {
          const avgResponseTime = batch.reduce((sum, order) => 
            sum + order.predictionTime, 0) / monitor.BATCH_SIZE;

          responseTimePoints.push({
            batchNumber: i + 1,
            time: batch[batch.length - 1].orderTimestamp,
            avgResponseTime,
            orderRange: `${batchStart + 1}-${batchStart + monitor.BATCH_SIZE}`
          });
        }
      }

      setResponseTimeData(responseTimePoints);
    };

    updateResponseTime();
  }, [orderHistory]);

  const chartData = useMemo(() => {
    if (!responseTimeData || responseTimeData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Average Response Time (ms)',
          data: [],
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1
        }]
      };
    }

    return {
      labels: responseTimeData.map(point => `Batch ${point.orderRange}`),
      datasets: [{
        label: 'Average Response Time (ms)',
        data: responseTimeData.map(point => 
          point.avgResponseTime ? point.avgResponseTime.toFixed(2) : 0
        ),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }]
    };
  }, [responseTimeData]);

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(
          ...responseTimeData.map(point => point.avgResponseTime || 0)
        ) + 10
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
            const point = responseTimeData[context.dataIndex];
            if (!point) return [];
            return [
              `Avg Response Time: ${Number(point.avgResponseTime || 0).toFixed(2)} ms`,
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
      title={monitor.title}
      data={monitor.createChartData(responseTimeData)}
      options={monitor.createOptions(responseTimeData)}
    />
  );
};

export default ResponseTimeMonitor;
