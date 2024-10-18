class Waiter {
  constructor(model) {
    this.model = model;
  }

  async predictWine(order) {
    return await this.model.predict(order);
  }

  setModel(model) {
    this.model = model;
  }

  getModel() {
    return this.model;
  }
}

export default Waiter;
