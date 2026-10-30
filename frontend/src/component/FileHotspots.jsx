/**
 * FileHotspots Component
 * Displays scatter plots mapping code complexity against modification frequency
 * to highlight refactoring priorities.
 */
import React, { useState } from 'react';
import { Flame, FileText, BarChart } from 'lucide-react';

export default function FileHotspots({ hotspots }) {
  const [minCommits, setMinCommits] = useState(1);

  if (!hotspots || hotspots.length === 0) {
    return <p className="no-data">No hotspot analysis available.</p>;
  }

  const filtered = hotspots.filter(h => h.commits >= minCommits);

  const getIntensityColor = (commits) => {
    if (commits > 20) return '#ff4747';
    if (commits > 12) return '#ff7a45';
    if (commits > 5) return '#ffc069';
    return '#85a5ff';
  };

  return (
    <div className="file-hotspots-container">
      <div className="hotspot-filter glass-panel">
        <div className="range-label">
          <span>Min Commits Filter: <strong>{minCommits}</strong></span>
          <Flame size={16} className="flame-icon" style={{ color: getIntensityColor(minCommits * 4) }} />
        </div>
        <input 
          type="range" 
          min="1" 
          max="25" 
          value={minCommits} 
          onChange={(e) => setMinCommits(Number(e.target.value))} 
          className="slider"
        />
      </div>

      <div className="hotspots-list">
        {filtered.map((file, idx) => (
          <div key={idx} className="hotspot-card glass-panel">
            <div className="hotspot-main">
              <FileText size={18} className="file-icon" />
              <div className="file-details">
                <span className="file-path" title={file.path}>{file.path}</span>
                <span className="file-meta">{file.linesChanged} lines changed</span>
              </div>
            </div>
            <div className="hotspot-badge" style={{ background: `${getIntensityColor(file.commits)}1c`, border: `1px solid ${getIntensityColor(file.commits)}` }}>
              <span style={{ color: getIntensityColor(file.commits) }}>{file.commits} edits</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="no-data">Adjust the filter slider to view less active hotspots.</p>
        )}
      </div>

      <style>{`
        .file-hotspots-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hotspot-filter {
          padding: 12px 16px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .range-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          color: #000000;
        }
        .flame-icon {
          animation: pulse 1.5s infinite alternate;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 1; }
        }
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          border: 1px solid #000000;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: 2px solid #000000;
        }
        .hotspots-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .hotspot-card {
          padding: 12px 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hotspot-card:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px #000000;
        }
        .hotspot-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .file-icon {
          color: #000000;
          flex-shrink: 0;
        }
        .file-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .file-path {
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-meta {
          font-size: 11px;
          color: #555555;
          font-weight: 600;
        }
        .hotspot-badge {
          padding: 4px 8px;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
          border: 2px solid #000000 !important;
          background: #ffffff !important;
        }
        .hotspot-badge span {
          color: #000000 !important;
        }
        .no-data {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          text-align: center;
          padding: 20px 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
