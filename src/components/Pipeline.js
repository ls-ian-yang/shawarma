import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Button, CircularProgress, Typography, Box, Accordion, AccordionSummary, 
  AccordionDetails, LinearProgress, TablePagination, styled, Snackbar, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useModelRegistry } from '../context/ModelRegistryContext';

const CommitButton = styled(Button)(({ allStepsCompleted }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  backgroundColor: allStepsCompleted ? 'primary.main' : 'grey.500',
  '&:hover': {
    backgroundColor: allStepsCompleted ? 'primary.dark' : 'grey.600',
  },
}));

// Add new styled component next to CommitButton
const AutoRunButton = styled(Button)({
  position: 'absolute',
  top: '16px',
  right: '180px',  // Increased from 140px to 180px to move it more to the left
});

const Pipeline = () => {
  const { orderHistory, waiter, commitModel, trainAndSaveModel } = useRestaurant();
  const { trainAndSaveModel: modelTrainAndSaveModel, commitModel: modelCommitModel } = useModelRegistry();
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
  const [metrics, setMetrics] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [committedVersion, setCommittedVersion] = useState(null);

  const extractedTableRef = useRef(null);
  const preparedTableRef = useRef(null);

  const [extractedPage, setExtractedPage] = useState(0);
  const [extractedRowsPerPage, setExtractedRowsPerPage] = useState(10);
  const [preparedPage, setPreparedPage] = useState(0);
  const [preparedRowsPerPage, setPreparedRowsPerPage] = useState(10);

  const [validationComplete, setValidationComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    extract: false,
    validate: false,
    prepare: false,
    train: false,
    evaluate: false,
    validateModel: false,
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleExtract = useCallback((orderHistory) => {
    const start = parseInt(startOrderNumber);
    const end = parseInt(endOrderNumber);
    
    if (isNaN(start) || isNaN(end)) {
      return;
    }
    
    const filtered = orderHistory.filter(order => 
      order.orderNumber >= start && order.orderNumber <= end
    );
    setExtractedOrders(filtered);
    setCompletedSteps(prev => ({ ...prev, extract: true }));
  }, [startOrderNumber, endOrderNumber]);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationComplete(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
    setValidationComplete(true);
    setCompletedSteps(prev => ({ ...prev, validate: true }));
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
    setCompletedSteps(prev => ({ ...prev, prepare: true }));
  }, [extractedOrders]);

  const handleTrain = useCallback(async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 100));
    }, 200);

    try {
      const newTempModel = await modelTrainAndSaveModel(preparedOrders);
      setTempModel(newTempModel);
      setCompletedSteps(prev => ({ ...prev, train: true }));
    } finally {
      clearInterval(progressInterval);
      setIsTraining(false);
      setTrainingProgress(100);
    }
  }, [preparedOrders, modelTrainAndSaveModel]);

  const handleCommitModel = useCallback(() => {
    if (tempModel) {
      modelCommitModel(tempModel);
      setCommittedVersion(tempModel.version); // Store the version before clearing tempModel
      setOpenSnackbar(true);
      setTempModel(null);
    }
  }, [tempModel, modelCommitModel]);

  const AccordionHeader = ({ title, step }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>{title}</Typography>
      {completedSteps[step] && (
        <CheckCircleIcon sx={{ color: 'success.main' }} />
      )}
    </Box>
  );

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

  const areAllStepsComplete = useCallback(() => {
    return Object.values(completedSteps).every(step => step);
  }, [completedSteps]);

  // Add new auto run function
  const handleAutoRun = useCallback(async () => {
    setIsAutoRunning(true);
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Step 1: Extract
      setExpandedPanel('panel1');
      await wait(500);
      
      setStartOrderNumber('1');
      setEndOrderNumber('100');
      await wait(1000);
      
      const extractButton = document.querySelector('[data-testid="extract-button"]');
      if (extractButton) {
        extractButton.click();
      }
      await wait(1000);

      // Step 2: Validate
      setExpandedPanel('panel2');
      await wait(500);
      const validateButton = document.querySelector('[data-testid="validate-button"]');
      if (validateButton) {
        validateButton.click();
      }
      await wait(1000);

      // Step 3: Prepare
      setExpandedPanel('panel3');
      await wait(500);
      const prepareButton = document.querySelector('[data-testid="prepare-button"]');
      if (prepareButton) {
        prepareButton.click();
      }
      await wait(1000);

      // Step 4: Train
      setExpandedPanel('panel4');
      await wait(500);
      const trainButton = document.querySelector('[data-testid="train-button"]');
      if (trainButton) {
        trainButton.click();
      }
      await wait(1000);

      // Step 5: Evaluate
      setExpandedPanel('panel5');
      await wait(500);
      const evaluateButton = document.querySelector('[data-testid="evaluate-button"]');
      if (evaluateButton) {
        evaluateButton.click();
      }
      await wait(1000);

      // Step 6: Validate Model
      setExpandedPanel('panel6');
      await wait(500);
      const validateModelButton = document.querySelector('[data-testid="validate-model-button"]');
      if (validateModelButton) {
        validateModelButton.click();
      }
      await wait(1000);

    } finally {
      setIsAutoRunning(false);
    }
  }, [setExpandedPanel, setStartOrderNumber, setEndOrderNumber]);

  return (
    <Box sx={{ padding: 2, position: 'relative' }}>
      <Typography variant="h4" gutterBottom>Data Cleaning Pipeline</Typography>
      
      <AutoRunButton
        variant="contained"
        onClick={handleAutoRun}
        disabled={isAutoRunning}
        sx={{ backgroundColor: 'secondary.main' }}
      >
        {isAutoRunning ? 'Running...' : 'Auto Run'}
      </AutoRunButton>

      <CommitButton
        variant="contained"
        onClick={handleCommitModel}
        disabled={!areAllStepsComplete()}
        allStepsCompleted={areAllStepsComplete()}
      >
        Commit Model
      </CommitButton>

      <Accordion expanded={expandedPanel === 'panel1'} onChange={handleAccordionChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccordionHeader title="1. Data Extraction" step="extract" />
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
            <Button 
              variant="contained" 
              onClick={() => handleExtract(orderHistory)}
              data-testid="extract-button"  // Add this line
            >
              Extract
            </Button>
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
          <AccordionHeader title="2. Validate Data" step="validate" />
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={handleValidate} 
            disabled={isValidating || extractedOrders.length === 0}
            data-testid="validate-button"
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
          <AccordionHeader title="3. Data Preparation" step="prepare" />
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={handlePrepare} 
            disabled={isPreparing || isValidating || extractedOrders.length === 0}
            data-testid="prepare-button"
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
          <AccordionHeader title="4. Train Model" step="train" />
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={handleTrain} 
            disabled={isTraining || preparedOrders.length === 0}
            data-testid="train-button"
          >
            Train Model
          </Button>
          {isTraining && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={trainingProgress} />
            </Box>
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

      <Accordion expanded={expandedPanel === 'panel5'} onChange={handleAccordionChange('panel5')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccordionHeader title="5. Evaluate Model" step="evaluate" />
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={async () => {
              setIsValidating(true);
              await new Promise(resolve => setTimeout(resolve, 1000));
              setIsValidating(false);
              setAccuracy(Math.round(Math.random() * 20 + 80));
              setCompletedSteps(prev => ({ ...prev, evaluate: true }));
            }}
            disabled={!completedSteps.train}
            data-testid="evaluate-button"
          >
            Evaluate Model
          </Button>
          {isValidating && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
          {accuracy && (
            <Typography sx={{ mt: 2, color: 'success.main' }}>
              Accuracy: {accuracy}%
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expandedPanel === 'panel6'} onChange={handleAccordionChange('panel6')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AccordionHeader title="6. Validate Model" step="validateModel" />
        </AccordionSummary>
        <AccordionDetails>
          <Button 
            variant="contained" 
            onClick={async () => {
              setMetrics({
                accuracy: {
                  new: '92%',
                  current: '89%',
                  benchmark: '85%'
                },
                qps: {
                  new: '1200',
                  current: '1000',
                  benchmark: '800'
                },
                invalidRate: {
                  new: '0.5%',
                  current: '1.2%',
                  benchmark: '2%'
                },
                unitTests: {
                  new: '100%',
                  current: '100%',
                  benchmark: '98%'
                }
              });
              setCompletedSteps(prev => ({ ...prev, validateModel: true }));
            }}
            disabled={!completedSteps.evaluate}
            data-testid="validate-model-button"
          >
            Validate Model
          </Button>
          {metrics && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>New Model</TableCell>
                    <TableCell>Current Model</TableCell>
                    <TableCell>Benchmark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(metrics).map(([metric, values]) => (
                    <TableRow key={metric}>
                      <TableCell>{metric.charAt(0).toUpperCase() + metric.slice(1)}</TableCell>
                      <TableCell>{values.new}</TableCell>
                      <TableCell>{values.current}</TableCell>
                      <TableCell>{values.benchmark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          icon={<CheckCircleOutlineIcon />}
          sx={{ 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          Model #{committedVersion} Saved to Registry!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pipeline;
