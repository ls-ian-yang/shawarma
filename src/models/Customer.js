class Customer {
  constructor() {
    this.preferences = this.generatePreferences();
  }

  generatePreferences() {
    const wines = ['A', 'B', 'C', 'D'];
    return {
      preferredWine: wines[Math.floor(Math.random() * wines.length)]
    };
  }

  generateOrder() {
    const foods = ['A', 'B', 'C', 'D'];
    const orderLength = Math.floor(Math.random() * 5) + 1; // 1 to 5 items
    return Array.from({length: orderLength}, () => foods[Math.floor(Math.random() * foods.length)]);
  }

  getDesiredWine() {
    return this.preferences.preferredWine;
  }
}

export default Customer;
