import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Card, CardContent, Typography, Button, Box, Paper, Stack } from '@mui/material';

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
              <Card 
                key={model.version}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: selectedModel?.version === model.version ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    boxShadow: 3,
                  },
                  height: '200px', // Increased height
                }}
                onClick={() => handleSelectModel(model)}
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
                      handleDeleteModel(model.version);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
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
    </Box>
  );
};

export default ModelRegistryPage;
