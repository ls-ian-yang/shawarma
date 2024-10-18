class SimpleModel {
  constructor() {
    this.version = 'simple-1.0';
  }

  predict(order) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('D'); // Always predicts wine D
      }, 0); // 0.5 second delay
    });
  }
}

export default SimpleModel;
