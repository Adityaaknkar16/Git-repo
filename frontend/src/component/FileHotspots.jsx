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
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .range-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
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
          height: 6px;
          border-radius: 3px;
          background: #2b2b36;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
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
          padding: 12px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .hotspot-card:hover {
          transform: translateX(4px);
          border-color: #4a4a58;
        }
        .hotspot-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .file-icon {
          color: var(--muted);
          flex-shrink: 0;
        }
        .file-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .file-path {
          font-family: monospace;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-meta {
          font-size: 11px;
          color: var(--muted);
        }
        .hotspot-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .no-data {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          padding: 20px 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
