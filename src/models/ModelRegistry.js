import DummyAIModel from './DummyAIModel';
import { useRestaurant } from '../context/RestaurantContext';

class ModelRegistry {
  constructor() {
    this.models = new Map();
    this.currentVersion = 0;
    this.loadModels();
  }

  loadModels() {
    const storedModels = JSON.parse(localStorage.getItem('aiModels')) || {};
    Object.entries(storedModels).forEach(([version, modelData]) => {
      const model = new DummyAIModel(parseInt(version));
      model.load(JSON.stringify(modelData));
      this.models.set(parseInt(version), model);
    });
    this.currentVersion = Math.max(0, ...this.models.keys());
  }

  persistModels() {
    const modelsToStore = {};
    this.models.forEach((model, version) => {
      modelsToStore[version] = JSON.parse(model.persist());
    });
    localStorage.setItem('aiModels', JSON.stringify(modelsToStore));
  }

  async trainAndSaveModel(data) {
    const newVersion = this.currentVersion + 1;
    const tempModel = new DummyAIModel(newVersion);
    await tempModel.train(data);
    return tempModel;
  }

  getAllModels() {
    return Array.from(this.models.entries()).map(([version, model]) => ({
      version,
      lastTrained: model.lastTrained,
      // Add any other metadata you want to include
    }));
  }

  getModelByVersion(version) {
    return this.models.get(version);
  }

  deleteModel(version) {
    if (this.models.has(version)) {
      this.models.delete(version);
      this.persistModels();
      return true;
    }
    return false;
  }

  commitModel(tempModel) {
    this.currentVersion = tempModel.version;
    this.models.set(this.currentVersion, tempModel);
    this.persistModels();
  }

  getModelInfo() {
    return {
      totalModels: this.models.size
    };
  }
}

// Don't export a singleton instance here
export default ModelRegistry;
