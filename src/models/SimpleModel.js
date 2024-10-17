class SimpleModel {
  predict(order) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('D'); // Always predicts wine D
      }, 0); // 0.5 second delay
    });
  }
}

export default SimpleModel;
