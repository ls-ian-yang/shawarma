class Waiter {
  constructor(model) {
    this.model = model;
  }

  async predictWine(order) {
    console.log('the model is:', this.model);
    return await this.model.predict(order);
  }

  setModel(model) {
    console.log('Setting model to:', model);
    this.model = model;
  }
}

export default Waiter;

