class DataCollector {
  constructor() {
    this.interactions = [];
  }

  recordInteraction(interactionData) {
    this.interactions.push({
      order: interactionData.order,
      desiredWine: interactionData.desiredWine,
      predictedWine: interactionData.predictedWine,
      satisfied: interactionData.satisfied,
      predictionTime: interactionData.predictionTime,
      orderTimestamp: interactionData.orderTimestamp
    });
  }

  getData() {
    return this.interactions;
  }
}

export default DataCollector;
