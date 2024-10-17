import Papa from 'papaparse';

export const saveOrderToCSV = (order) => {
  const csv = localStorage.getItem('orderHistoryCSV') || '';
  const existingData = csv ? Papa.parse(csv, { header: true }).data : [];
  const orderToSave = {
    orderNumber: order.orderNumber?.toString() || '',
    orderTimestamp: order.orderTimestamp?.toString() || '',
    order: Array.isArray(order.order) ? order.order.join(',') : (order.order?.toString() || ''),
    desiredWine: order.desiredWine?.toString() || '',
    predictedWine: order.predictedWine?.toString() || '',
    satisfied: order.satisfied ? 'true' : 'false',
    predictionTime: order.predictionTime?.toString() || '',
  };
  existingData.push(orderToSave);
  const updatedCsv = Papa.unparse(existingData);
  localStorage.setItem('orderHistoryCSV', updatedCsv);
};

export const loadOrderHistoryFromCSV = () => {
  return new Promise((resolve) => {
    const csv = localStorage.getItem('orderHistoryCSV');
    if (!csv) {
      resolve([]);
      return;
    }

    Papa.parse(csv, {
      header: true,
      complete: (results) => {
        const parsedData = results.data
          .filter(order => order.orderNumber) // Filter out any empty rows
          .map(order => ({
            orderNumber: parseInt(order.orderNumber, 10) || 0,
            orderTimestamp: order.orderTimestamp || '',
            order: order.order ? (order.order.includes(',') ? order.order.split(',') : [order.order]) : [],
            desiredWine: order.desiredWine || '',
            predictedWine: order.predictedWine || '',
            satisfied: order.satisfied === 'true',
            predictionTime: parseFloat(order.predictionTime) || 0,
          }));
        resolve(parsedData);
      },
    });
  });
};

export const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const clearOrderHistoryCSV = () => {
  localStorage.removeItem('orderHistoryCSV');
};
