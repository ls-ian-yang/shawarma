import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material';

const ModelRegistryPage = () => {
  const { modelRegistry, waiter, setCurrentPage } = useRestaurant();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentStaffModel, setCurrentStaffModel] = useState({ version: '(No version available)' });

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

  const handleDeleteModel = (version) => {
    const success = modelRegistry.deleteModel(version);
    if (success) {
      alert(`Model version ${version} deleted successfully!`);
      updateModels();
      updateCurrentStaffModel();
      if (selectedModel && selectedModel.version === version) {
        setSelectedModel(null);
      }
    } else {
      alert('Failed to delete model.');
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>Model Management</Typography>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h6" gutterBottom>Available Models</Typography>
          <Grid container spacing={2}>
            {models.map((model) => (
              <Grid item xs={4} key={model.version}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: selectedModel?.version === model.version ? 'action.selected' : 'background.paper'
                  }}
                  onClick={() => handleSelectModel(model)}
                >
                  <CardContent>
                    <Typography variant="h6">Version: {model.version}</Typography>
                    <Typography>Last Trained: {new Date(model.lastTrained).toLocaleString()}</Typography>
                    <Button 
                      size="small" 
                      color="secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModel(model.version);
                      }}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" gutterBottom>Model Assignment</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography>Current Staff Model: {currentStaffModel.version}</Typography>
          </Box>
          {selectedModel && (
            <Box>
              <Typography>Selected Model: {selectedModel.version}</Typography>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModelRegistryPage;
