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
}

export default Waiter;
