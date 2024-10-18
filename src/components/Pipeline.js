import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Button, CircularProgress, Typography, Box, Accordion, AccordionSummary, 
  AccordionDetails, LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DummyAIModel from '../models/DummyAIModel';
import ModelRegistry from '../models/ModelRegistry';

const Pipeline = () => {
  const { 
    waiter, 
    modelRegistry,
    setCurrentPage, 
    orderHistory 
  } = useRestaurant();
  const modelRegistryRef = useRef(null);

  useEffect(() => {
    modelRegistryRef.current = new ModelRegistry(waiter);
  }, [waiter]);

  useEffect(() => {
    setCurrentPage('pipeline');
  }, [setCurrentPage]);

  const [startOrderNumber, setStartOrderNumber] = useState('');
  const [endOrderNumber, setEndOrderNumber] = useState('');
  const [extractedOrders, setExtractedOrders] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [preparedOrders, setPreparedOrders] = useState([]);
  const [expandedPanel, setExpandedPanel] = useState('panel1');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [tempModel, setTempModel] = useState(null);

  const tempModelRef = useRef(new DummyAIModel());

  const extractedTableRef = useRef(null);
  const preparedTableRef = useRef(null);
  const shouldRestoreScroll = useRef(true);

  // Use useMemo to create static references for extractedOrders and preparedOrders
  const extractedOrdersRef = useRef([]);
  const preparedOrdersRef = useRef([]);

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

  const handleExtract = useCallback(() => {
    const start = parseInt(startOrderNumber);
    const end = parseInt(endOrderNumber);
    const filtered = orderHistory.filter(order => 
      order.orderNumber >= start && order.orderNumber <= end
    );
    extractedOrdersRef.current = filtered;
    setExtractedOrders(filtered);
    
    // Reset scroll position for extracted orders
    localStorage.setItem('extractedScrollPos', '0');
    if (extractedTableRef.current) {
      extractedTableRef.current.scrollTop = 0;
    }
  }, [orderHistory, startOrderNumber, endOrderNumber]);

  const handleValidate = async () => {
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
  };

  const handlePrepare = useCallback(() => {
    setIsPreparing(true);
    const oddOrders = extractedOrdersRef.current.filter(order => order.orderNumber % 2 !== 0);
    preparedOrdersRef.current = oddOrders;
    setPreparedOrders(oddOrders);
    setIsPreparing(false);

    // Reset scroll position for prepared orders
    localStorage.setItem('preparedScrollPos', '0');
    if (preparedTableRef.current) {
      preparedTableRef.current.scrollTop = 0;
    }
  }, []);

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

  const handleTrain = useCallback(async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 100));
    }, 200);

    try {
      const newTempModel = await modelRegistry.trainAndSaveModel(preparedOrders);
      setTempModel(newTempModel);
    } finally {
      clearInterval(progressInterval);
      setIsTraining(false);
      setTrainingProgress(100);
    }
  }, [modelRegistry, preparedOrders]);

  const handleCommitModel = useCallback(() => {
    if (tempModel) {
      modelRegistry.commitModel(tempModel);
      setTempModel(null);
    }
  }, [modelRegistry, tempModel]);

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

      <Accordion expanded={expandedPanel === 'panel4'} onChange={handleAccordionChange('panel4')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">4: Train Model</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Button 
              variant="contained" 
              onClick={handleTrain} 
              disabled={isTraining || preparedOrders.length === 0}
            >
              Train Model
            </Button>
            {isTraining && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={trainingProgress} />
              </Box>
            )}
            {tempModel && (
              <Button 
                variant="contained" 
                onClick={handleCommitModel} 
                sx={{ mt: 2, ml: 2 }}
              >
                Commit Model
              </Button>
            )}
          {tempModel && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Temporary Model Info</Typography>
              <Typography>Version: {tempModel.version}</Typography>
              <Typography>Last Trained: {tempModel.lastTrained}</Typography>
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Pipeline;
