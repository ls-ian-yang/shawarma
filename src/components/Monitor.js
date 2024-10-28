import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useRestaurant } from '../context/RestaurantContext';
import QPSMonitor from './monitors/QPSMonitor';
import AccuracyMonitor from './monitors/AccuracyMonitor';
import ResponseTimeMonitor from './monitors/ResponseTimeMonitor';

const Monitor = () => {
  const { setCurrentPage } = useRestaurant();

  useEffect(() => {
    setCurrentPage('monitor');
  }, [setCurrentPage]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Monitoring
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <QPSMonitor />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <AccuracyMonitor />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <ResponseTimeMonitor />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Monitor;
