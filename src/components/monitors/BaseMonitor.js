import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BaseMonitor = ({ title, data, options, updateInterval = 5000 }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (chartRef.current) {
        chartRef.current.update();
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Line ref={chartRef} data={data} options={options} />
    </Box>
  );
};

export default BaseMonitor;
