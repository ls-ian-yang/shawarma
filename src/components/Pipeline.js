import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Button, CircularProgress, Typography, Box, Accordion, AccordionSummary, 
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Pipeline = () => {
  const { orderHistory, setCurrentPage } = useRestaurant();
  const [startOrderNumber, setStartOrderNumber] = useState('');
  const [endOrderNumber, setEndOrderNumber] = useState('');
  const [extractedOrders, setExtractedOrders] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparedOrders, setPreparedOrders] = useState([]);
  const [expandedPanel, setExpandedPanel] = useState('panel1');

  const extractedTableRef = useRef(null);
  const preparedTableRef = useRef(null);
  const shouldRestoreScroll = useRef(true);

  useEffect(() => {
    setCurrentPage('pipeline');
  }, [setCurrentPage]);

  const restoreScrollPosition = useCallback(() => {
    const extractedScrollPos = localStorage.getItem('extractedScrollPos');
    const preparedScrollPos = localStorage.getItem('preparedScrollPos');
    
    if (extractedScrollPos && extractedTableRef.current) {
      extractedTableRef.current.scrollTop = parseInt(extractedScrollPos);
    }
    if (preparedScrollPos && preparedTableRef.current) {
      preparedTableRef.current.scrollTop = parseInt(preparedScrollPos);
    }
  }, []);

  useLayoutEffect(() => {
    if (shouldRestoreScroll.current) {
      restoreScrollPosition();
      shouldRestoreScroll.current = false;
    }
  }, [restoreScrollPosition, orderHistory]);

  useEffect(() => {
    shouldRestoreScroll.current = true;
  }, [orderHistory]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleExtract = () => {
    const start = parseInt(startOrderNumber);
    const end = parseInt(endOrderNumber);
    const filtered = orderHistory.filter(order => 
      order.orderNumber >= start && order.orderNumber <= end
    );
    setExtractedOrders(filtered);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
  };

  const handlePrepare = () => {
    setIsPreparing(true);
    const oddOrders = extractedOrders.filter(order => order.orderNumber % 2 !== 0);
    setPreparedOrders(oddOrders);
    setIsPreparing(false);
  };

  const handleScroll = useCallback((ref, key) => {
    if (ref.current) {
      localStorage.setItem(key, ref.current.scrollTop.toString());
    }
  }, []);

  const DataTable = React.forwardRef(({ data, onScroll }, ref) => (
    <TableContainer 
      component={Paper} 
      sx={{ maxHeight: 400, overflow: 'auto' }} 
      ref={ref}
      onScroll={onScroll}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Order Number</TableCell>
            <TableCell>Order</TableCell>
            <TableCell>Desired Wine</TableCell>
            <TableCell>Predicted Wine</TableCell>
            <TableCell>Satisfied</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.orderNumber}>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.order.join(', ')}</TableCell>
              <TableCell>{order.desiredWine}</TableCell>
              <TableCell>{order.predictedWine}</TableCell>
              <TableCell>{order.satisfied ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ));

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>Data Cleaning Pipeline</Typography>
      
      <Accordion expanded={expandedPanel === 'panel1'} onChange={handleAccordionChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">1. Data Extraction</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              label="Start Order Number"
              type="number"
              value={startOrderNumber}
              onChange={(e) => setStartOrderNumber(e.target.value)}
              sx={{ marginRight: 1 }}
            />
            <TextField
              label="End Order Number"
              type="number"
              value={endOrderNumber}
              onChange={(e) => setEndOrderNumber(e.target.value)}
              sx={{ marginRight: 1 }}
            />
            <Button variant="contained" onClick={handleExtract}>Extract</Button>
          </Box>
          {extractedOrders.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Extracted Orders: {extractedOrders.length}
              </Typography>
              <DataTable 
                data={extractedOrders} 
                ref={extractedTableRef}
                onScroll={() => handleScroll(extractedTableRef, 'extractedScrollPos')}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expandedPanel === 'panel2'} onChange={handleAccordionChange('panel2')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">2. Data Validation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={handleValidate} 
            disabled={isValidating || extractedOrders.length === 0}
          >
            {isValidating ? <CircularProgress size={24} /> : 'Validate'}
          </Button>
          {!isValidating && extractedOrders.length > 0 && (
            <Typography sx={{ mt: 2 }}>Validation complete!</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expandedPanel === 'panel3'} onChange={handleAccordionChange('panel3')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">3. Data Preparation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={handlePrepare} 
            disabled={isPreparing || isValidating || extractedOrders.length === 0}
          >
            {isPreparing ? <CircularProgress size={24} /> : 'Prepare'}
          </Button>
          {preparedOrders.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Prepared Orders (Odd Order Numbers): {preparedOrders.length}
              </Typography>
              <DataTable 
                data={preparedOrders} 
                ref={preparedTableRef}
                onScroll={() => handleScroll(preparedTableRef, 'preparedScrollPos')}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Pipeline;
