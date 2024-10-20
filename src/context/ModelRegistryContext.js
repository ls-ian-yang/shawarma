import React, { createContext, useContext, useState, useCallback } from 'react';
import ModelRegistry from '../models/ModelRegistry';

const ModelRegistryContext = createContext();

export const useModelRegistry = () => useContext(ModelRegistryContext);

export const ModelRegistryProvider = ({ children }) => {
  const [modelRegistry] = useState(() => new ModelRegistry());
  const [models, setModels] = useState(new Map());

  const updateModels = useCallback(() => {
    setModels(new Map(modelRegistry.models));
  }, [modelRegistry]);

  const trainAndSaveModel = useCallback(async (preparedOrders) => {
    return modelRegistry.trainAndSaveModel(preparedOrders);
  }, [modelRegistry]);

  const commitModel = useCallback((tempModel) => {
    modelRegistry.commitModel(tempModel);
    updateModels();
  }, [modelRegistry, updateModels]);

  const deleteModel = useCallback((version) => {
    const success = modelRegistry.deleteModel(version);
    if (success) {
      updateModels();
    }
    return success;
  }, [modelRegistry, updateModels]);

  const value = {
    models,
    trainAndSaveModel,
    commitModel,
    deleteModel,
    updateModels,
  };

  return (
    <ModelRegistryContext.Provider value={value}>
      {children}
    </ModelRegistryContext.Provider>
  );
};
