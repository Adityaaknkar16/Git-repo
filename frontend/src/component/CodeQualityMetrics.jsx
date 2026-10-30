/**
 * CodeQualityMetrics Component
 * Displays aggregations of complexity, code comments ratio, duplication rates,
 * and lint rules compliance.
 */
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Activity, ShieldCheck, Award } from 'lucide-react';

ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function CodeQualityMetrics() {
  // Mock trend data for coverage
  const lineData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'],
    datasets: [
      {
        label: 'Test Coverage %',
        data: [62, 65, 71, 74, 78, 83],
        borderColor: '#00e575',
        backgroundColor: 'rgba(0, 229, 117, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Linter Errors', 'Warnings', 'Clean Files'],
    datasets: [
      {
        data: [4, 18, 78],
        backgroundColor: ['#ff4747', '#ffaa00', '#00e575'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: '#e0e0e0' }, ticks: { color: '#000000', font: { family: 'monospace', weight: 'bold' } } },
      x: { grid: { color: '#e0e0e0' }, ticks: { color: '#000000', font: { family: 'monospace', weight: 'bold' } } },
    },
  };

  return (
    <div className="code-quality-container">
      <div className="metrics-summary">
        <div className="metric-score-card glass-panel">
          <Award size={20} className="score-icon" />
          <div className="score-details">
            <span className="label">Quality Grade</span>
            <span className="value">A-</span>
          </div>
        </div>
        <div className="metric-score-card glass-panel">
          <ShieldCheck size={20} className="score-icon secure" />
          <div className="score-details">
            <span className="label">Security Audit</span>
            <span className="value">Passed</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h4>Test Coverage Trend</h4>
          <div className="chart-wrapper">
            <Line data={lineData} options={options} />
          </div>
        </div>
        <div className="chart-card glass-panel">
          <h4>Linter Diagnostics</h4>
          <div className="chart-wrapper doughnut">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <style>{`
        .code-quality-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .metrics-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .metric-score-card {
          padding: 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .score-icon {
          color: #000000;
        }
        .score-icon.secure {
          color: #000000;
        }
        .score-details {
          display: flex;
          flex-direction: column;
        }
        .score-details .label {
          font-size: 12px;
          font-weight: 700;
          color: #555555;
        }
        .score-details .value {
          font-size: 20px;
          font-weight: 800;
          font-family: monospace;
          color: #000000;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .chart-card {
          padding: 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0px #000000;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chart-card h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #000000;
        }
        .chart-wrapper {
          height: 180px;
          position: relative;
        }
        .chart-wrapper.doughnut {
          height: 150px;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
