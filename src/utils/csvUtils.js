import Papa from 'papaparse';

export const saveOrderHistoryToCSV = (orderHistory) => {
  const csv = Papa.unparse(orderHistory);
  localStorage.setItem('orderHistoryCSV', csv);
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
        resolve(results.data);
      },
    });
  });
};
