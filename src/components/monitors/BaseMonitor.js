import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

class MonitorBase {
  constructor(title, yAxisLabel, color = 'rgb(75, 192, 192)') {
    this.title = title;
    this.yAxisLabel = yAxisLabel;
    this.color = color;
  }

  createChartData(data) {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: this.yAxisLabel,
          data: [],
          borderColor: this.color,
          tension: 0.1
        }]
      };
    }

    return {
      labels: this.getLabels(data),
      datasets: [{
        label: this.yAxisLabel,
        data: this.getData(data),
        borderColor: this.color,
        tension: 0.1
      }]
    };
  }

  createOptions(data, baselineValue, hoveredValue) {
    return {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: this.getYAxisMax(data)
        },
        x: {
          grid: {
            display: true
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      },
      animation: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => this.getTooltipLabels(data[context.dataIndex])
          }
        },
        annotation: {
          annotations: {
            baseline: baselineValue ? {
              type: 'line',
              yMin: baselineValue,
              yMax: baselineValue,
              borderColor: 'rgba(255, 0, 0, 1)',
              borderWidth: 2,
              label: {
                display: true,
                content: `Baseline: ${baselineValue.toFixed(2)}`,
                position: 'start'
              }
            } : undefined,
            hoverLine: hoveredValue ? {
              type: 'line',
              yMin: hoveredValue,
              yMax: hoveredValue,
              borderColor: 'rgba(255, 0, 0, 0.3)',
              borderWidth: 2,
              borderDash: [6, 6]
            } : undefined
          }
        }
      },
      onHover: null // Will be set in the component
    };
  }

  // These methods should be overridden by child classes
  getLabels(data) { return []; }
  getData(data) { return []; }
  getYAxisMax(data) { return 0; }
  getTooltipLabels(point) { return []; }
}

// React component that renders the monitor
const BaseMonitor = ({ title, data, options }) => {
  const [baseline, setBaseline] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const chartInstanceRef = useRef(null);

  const chartRef = useCallback((node) => {
    if (node) {
      chartInstanceRef.current = node;
      
      node.canvas.addEventListener('mousemove', (event) => {
        const chart = chartInstanceRef.current;
        if (!chart) return;
        
        const rect = chart.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        // Get the chart area bounds
        const chartArea = chart.chartArea;
        
        // Check if mouse is within the chart area (not including axes)
        if (y >= chartArea.top && y <= chartArea.bottom) {
          const yValue = chart.scales.y.getValueForPixel(y);
          setHoveredValue(yValue);
        } else {
          setHoveredValue(null);
        }
      });

      node.canvas.addEventListener('mouseleave', () => {
        setHoveredValue(null);
      });

      node.canvas.addEventListener('click', (event) => {
        const chart = chartInstanceRef.current;
        if (!chart) return;
        
        const rect = chart.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        
        // Get the chart area bounds
        const chartArea = chart.chartArea;
        
        // Only set baseline if click is within chart area (not including axes)
        if (y >= chartArea.top && y <= chartArea.bottom) {
          const yValue = chart.scales.y.getValueForPixel(y);
          setBaseline(yValue);
        }
      });
    }
  }, []);

  const enhancedOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      annotation: {
        annotations: {
          baseline: baseline ? {
            type: 'line',
            yMin: baseline,
            yMax: baseline,
            borderColor: 'rgba(255, 0, 0, 1)', // Changed to 50% opacity
            borderWidth: 2,
            label: {
              display: true,
              content: `Baseline: ${baseline.toFixed(2)}`,
              position: 'start',
              backgroundColor: 'rgba(0, 0, 0, 0.4)', // Made label background semi-transparent
              color: 'white', // Made text white for better contrast
              font: {
                weight: 'bold'
              }
            }
          } : undefined,
          hoverLine: hoveredValue ? {
            type: 'line',
            yMin: hoveredValue,
            yMax: hoveredValue,
            borderColor: 'rgba(255, 0, 0, 0.3)',
            borderWidth: 2,
            borderDash: [6, 6]
          } : undefined
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Line ref={chartRef} data={data} options={enhancedOptions} />
    </Box>
  );
};

export { MonitorBase, BaseMonitor };
