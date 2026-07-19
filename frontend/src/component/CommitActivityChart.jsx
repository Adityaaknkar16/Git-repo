/**
 * CommitActivityChart Component
 * A lightweight line/bar chart displaying daily/hourly commit rates.
 */
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CommitActivityChart = ({ activity }) => {
  const data = {
    labels: activity.map(a => a.date), // The dates
    datasets: [
      {
        label: 'Commits',
        data: activity.map(a => a.commits), // The commit counts
        backgroundColor: '#646cff',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Recent Commit Activity',
        color: '#fff',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#aaa' },
        grid: { color: '#444' },
      },
      x: {
        ticks: { color: '#aaa' },
        grid: { color: '#444' },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
export default CommitActivityChart;