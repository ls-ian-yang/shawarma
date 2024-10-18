import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Card, CardContent, Typography, Button, Box, Paper, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ButtonBase } from '@mui/material';

const ModelRegistryPage = () => {
  const { modelRegistry, waiter, setCurrentPage } = useRestaurant();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentStaffModel, setCurrentStaffModel] = useState({ version: '(No version available)' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, version: null });

  useEffect(() => {
    setCurrentPage('modelRegistry');
    updateModels();
    updateCurrentStaffModel();
  }, [setCurrentPage]);

  const updateModels = () => {
    setModels(modelRegistry.getAllModels());
  };

  const updateCurrentStaffModel = () => {
    try {
      const staffModel = waiter.getModel();
      setCurrentStaffModel(staffModel && staffModel.version ? 
        { version: staffModel.version } : 
        { version: '(No version available)' }
      );
    } catch (error) {
      console.error('Error getting current model:', error);
      setCurrentStaffModel({ version: '(No version available)' });
    }
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
  };

  const handleLoadModelToStaff = () => {
    if (selectedModel) {
      const model = modelRegistry.getModelByVersion(selectedModel.version);
      if (model) {
        waiter.setModel(model);
        alert(`Model version ${selectedModel.version} loaded to staff successfully!`);
        updateCurrentStaffModel();
      } else {
        alert('Failed to load model to staff.');
      }
    }
  };

  const handleDeleteConfirmation = (version) => {
    setDeleteConfirmation({ open: true, version });
  };

  const handleDeleteConfirmed = () => {
    const success = modelRegistry.deleteModel(deleteConfirmation.version);
    if (success) {
      alert(`Model version ${deleteConfirmation.version} deleted successfully!`);
      updateModels();
      updateCurrentStaffModel();
      if (selectedModel && selectedModel.version === deleteConfirmation.version) {
        setSelectedModel(null);
      }
    } else {
      alert('Failed to delete model.');
    }
    setDeleteConfirmation({ open: false, version: null });
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>Model Registry</Typography>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          <Typography variant="h6" gutterBottom>Available Models</Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 2
          }}>
            {models.map((model) => (
              <ButtonBase
                key={model.version}
                onClick={() => handleSelectModel(model)}
                sx={{ 
                  display: 'block',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <Card 
                  sx={{ 
                    bgcolor: selectedModel?.version === model.version ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      boxShadow: 3,
                    },
                    height: '200px',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary">Model {model.version}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Trained: {new Date(model.lastTrained).toLocaleString()}
                    </Typography>
                    <Button 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConfirmation(model.version);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </ButtonBase>
            ))}
          </Box>
        </Box>
        <Box sx={{ width: 250 }}>
          <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 150px)' }}>
            <Typography variant="h6" gutterBottom>Model Assignment</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Current Staff Model: <strong>{currentStaffModel.version}</strong>
              </Typography>
            </Box>
            {selectedModel && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Selected Model: <strong>{selectedModel.version}</strong>
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleLoadModelToStaff}
                  sx={{ mt: 2 }}
                >
                  Load Model to Staff
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Stack>

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, version: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Model version {deleteConfirmation.version}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation({ open: false, version: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelRegistryPage;
