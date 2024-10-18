import SimpleModel from './SimpleModel';

class DummyAIModel extends SimpleModel {
  constructor(version = 1, lastTrained = null) {
    super();
    this.version = version;
    this.lastTrained = lastTrained;
    this.wineFrequency = {};
  }

  async train(data) {
    this.wineFrequency = {};
    
    data.forEach(order => {
      const orderKey = order.order.sort().join(',');
      if (!this.wineFrequency[orderKey]) {
        this.wineFrequency[orderKey] = {};
      }
      if (!this.wineFrequency[orderKey][order.desiredWine]) {
        this.wineFrequency[orderKey][order.desiredWine] = 0;
      }
      this.wineFrequency[orderKey][order.desiredWine]++;
    });

    this.lastTrained = new Date().toISOString();
  }

  async predict(order) {
    const orderKey = order.sort().join(',');
    const wineFreq = this.wineFrequency[orderKey];
    
    console.log('Predicting for order:', orderKey);
    console.log('Wine frequency data:', wineFreq);
  
    if (!wineFreq) {
      console.log('No data for this order, returning default prediction A');
      return 'A';
    }
  
    let maxFreq = 0;
    let predictedWine = 'A';
    
    for (const [wine, freq] of Object.entries(wineFreq)) {
      console.log(`Wine ${wine} has frequency ${freq}`);
      if (freq > maxFreq) {
        maxFreq = freq;
        predictedWine = wine;
      }
    }
  
    console.log('Predicted wine:', predictedWine);
    return predictedWine;
  }

  persist() {
    const modelData = {
      version: this.version,
      lastTrained: this.lastTrained,
      wineFrequency: this.wineFrequency,
    };
    return JSON.stringify(modelData);
  }

  load(modelData) {
    const parsedData = JSON.parse(modelData);
    this.version = parsedData.version;
    this.lastTrained = parsedData.lastTrained;
    this.wineFrequency = parsedData.wineFrequency;
  }
}

export default DummyAIModel;
