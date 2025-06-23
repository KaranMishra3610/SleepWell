import React from 'react';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SleepScoreGraph({ history }) {
  const labels = history.map((log, i) => `Entry ${i + 1}`);
  const data = {
    labels,
    datasets: [{
      label: 'Sleep Score History',
      data: history.map(log => log.sleep_score),
      fill: false,
      borderColor: 'blue',
      tension: 0.2
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Sleep Score Over Time' }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div style={{ width: '600px', marginTop: '1rem' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default SleepScoreGraph;
