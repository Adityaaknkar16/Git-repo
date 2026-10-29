import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const LanguageChart = ({ languages = {} }) => {
  const safeLanguages = languages || {};
  const languageNames = Object.keys(safeLanguages);
  const languageBytes = Object.values(safeLanguages);

  // Helper to generate curated colors
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const backgroundColors = languageNames.map(() => getRandomColor());

  const data = {
    labels: languageNames.length > 0 ? languageNames : ['No Data'],
    datasets: [
      {
        label: 'Bytes of Code',
        data: languageBytes.length > 0 ? languageBytes : [1],
        backgroundColor: backgroundColors.length > 0 ? backgroundColors : ['#4f46e5'],
        borderColor: '#1a1a1a',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#fff', padding: 15 },
      },
      title: {
        display: true,
        text: 'Language Distribution',
        color: '#fff',
        font: { size: 18 },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};
export default LanguageChart;