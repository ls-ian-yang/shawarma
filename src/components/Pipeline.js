import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Button, CircularProgress, Typography, Box, Accordion, AccordionSummary, 
  AccordionDetails, LinearProgress, TablePagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModelRegistry from '../models/ModelRegistry';

const Pipeline = () => {
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

  const extractedTableRef = useRef(null);
  const preparedTableRef = useRef(null);
  const modelRegistryRef = useRef(null);

  const [extractedPage, setExtractedPage] = useState(0);
  const [extractedRowsPerPage, setExtractedRowsPerPage] = useState(10);
  const [preparedPage, setPreparedPage] = useState(0);
  const [preparedRowsPerPage, setPreparedRowsPerPage] = useState(10);

  const [validationComplete, setValidationComplete] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleExtract = useCallback((orderHistory) => {
    const start = parseInt(startOrderNumber);
    const end = parseInt(endOrderNumber);
    const filtered = orderHistory.filter(order => 
      order.orderNumber >= start && order.orderNumber <= end
    );
    setExtractedOrders(filtered);
  }, [startOrderNumber, endOrderNumber]);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationComplete(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
    setValidationComplete(true);
  };

  const handlePrepare = useCallback(() => {
    setIsPreparing(true);
    const preparedData = extractedOrders.map(order => ({
      orderNumber: order.orderNumber,
      order: order.order,
      desiredWine: order.desiredWine
    }));
    setPreparedOrders(preparedData);
    setIsPreparing(false);
  }, [extractedOrders]);

  const handleTrain = useCallback(async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 100));
    }, 200);

    try {
      const newTempModel = await modelRegistryRef.current.trainAndSaveModel(preparedOrders);
      setTempModel(newTempModel);
    } finally {
      clearInterval(progressInterval);
      setIsTraining(false);
      setTrainingProgress(100);
    }
  }, [preparedOrders]);

  const handleCommitModel = useCallback(() => {
    if (tempModel && modelRegistryRef.current) {
      modelRegistryRef.current.commitModel(tempModel);
      setTempModel(null);
    }
  }, [tempModel]);

  const DataTable = React.forwardRef(({ data, page, rowsPerPage, onPageChange, onRowsPerPageChange, isPrepared }, ref) => (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ maxHeight: 400, overflow: 'auto' }} 
        ref={ref}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Desired Wine</TableCell>
              {!isPrepared && (
                <>
                  <TableCell>Predicted Wine</TableCell>
                  <TableCell>Satisfied</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.order.join(', ')}</TableCell>
                  <TableCell>{order.desiredWine}</TableCell>
                  {!isPrepared && (
                    <>
                      <TableCell>{order.predictedWine}</TableCell>
                      <TableCell>{order.satisfied ? 'Yes' : 'No'}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  ));

  return (
    <RestaurantContext.Consumer>
      {({ orderHistory, waiter }) => {
        if (!modelRegistryRef.current && waiter) {
          modelRegistryRef.current = new ModelRegistry(waiter);
        }

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
                  <Button variant="contained" onClick={() => handleExtract(orderHistory)}>Extract</Button>
                </Box>
                {extractedOrders.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Extracted Orders: {extractedOrders.length}
                    </Typography>
                    <DataTable 
                      data={extractedOrders} 
                      ref={extractedTableRef}
                      page={extractedPage}
                      rowsPerPage={extractedRowsPerPage}
                      onPageChange={(event, newPage) => setExtractedPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setExtractedRowsPerPage(parseInt(event.target.value, 10));
                        setExtractedPage(0);
                      }}
                      isPrepared={false}
                    />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={expandedPanel === 'panel2'} onChange={handleAccordionChange('panel2')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">2. Validate Data</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button 
                  variant="contained" 
                  onClick={handleValidate} 
                  disabled={isValidating || extractedOrders.length === 0}
                >
                  Validate
                </Button>
                {isValidating && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
                {validationComplete && (
                  <Typography sx={{ mt: 2, color: 'green' }}>
                    Validation complete!
                  </Typography>
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
                      Prepared Orders: {preparedOrders.length}
                    </Typography>
                    <DataTable 
                      data={preparedOrders} 
                      ref={preparedTableRef}
                      page={preparedPage}
                      rowsPerPage={preparedRowsPerPage}
                      onPageChange={(event, newPage) => setPreparedPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setPreparedRowsPerPage(parseInt(event.target.value, 10));
                        setPreparedPage(0);
                      }}
                      isPrepared={true}
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
      }}
    </RestaurantContext.Consumer>
  );
};

export default Pipeline;
