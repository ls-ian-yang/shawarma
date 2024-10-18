import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { exportToCSV, clearAllData } from '../utils/csvUtils';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, Pagination } from '@mui/material';

const DB = () => {
  const { 
    setCurrentPage, 
    orderHistory, 
    resetAllData 
  } = useRestaurant();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(100);

  useEffect(() => {
    setCurrentPage('db');
  }, [setCurrentPage]);

  const handleExport = () => {
    exportToCSV(orderHistory, 'order_history.csv');
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      resetAllData();
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedOrders = orderHistory.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>All Orders</Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleExport} sx={{ mr: 1 }}>Export to CSV</Button>
        <Button variant="contained" color="secondary" onClick={handleClearCache}>Clear All Data</Button>
      </Box>
      {orderHistory && orderHistory.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Desired Wine</TableCell>
                  <TableCell>Predicted Wine</TableCell>
                  <TableCell>Satisfied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.orderNumber}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.orderTimestamp).toLocaleString()}</TableCell>
                    <TableCell>{Array.isArray(order.order) ? order.order.join(', ') : order.order}</TableCell>
                    <TableCell>{order.desiredWine}</TableCell>
                    <TableCell>{order.predictedWine}</TableCell>
                    <TableCell>{order.satisfied ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination 
              count={Math.ceil(orderHistory.length / rowsPerPage)} 
              page={page} 
              onChange={handleChangePage} 
            />
          </Box>
        </>
      ) : (
        <Typography>No orders available.</Typography>
      )}
    </Box>
  );
};

export default DB;
