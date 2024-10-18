import DummyAIModel from './DummyAIModel';
import { useRestaurant } from '../context/RestaurantContext';

class ModelRegistry {
  constructor(waiter) {
    this.models = new Map();
    this.currentVersion = 0;
    this.waiter = waiter;
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

  getCurrentModel() {
    return this.models.get(this.currentVersion) || new DummyAIModel(this.currentVersion);
  }

  async trainAndSaveModel(data) {
    const newVersion = this.currentVersion + 1;
    const tempModel = new DummyAIModel(newVersion);
    await tempModel.train(data);
    return tempModel;
  }

  commitModel(tempModel) {
    this.currentVersion = tempModel.version;
    this.models.set(this.currentVersion, tempModel);
    this.persistModels();
    // Update the model used by the waiter
    if (this.waiter) {
      this.waiter.setModel(tempModel);
    }
  }

  getModelInfo() {
    const currentModel = this.getCurrentModel();
    return {
      version: currentModel.version,
      lastTrained: currentModel.lastTrained,
      totalModels: this.models.size
    };
  }

  getWaiter() {
    return this.waiter;
  }
}

// Don't export a singleton instance here
export default ModelRegistry;
