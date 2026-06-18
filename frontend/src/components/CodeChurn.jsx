import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, Treemap } from 'recharts';
import { Flame, File } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function CodeChurn({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [churnData, setChurnData] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchChurn = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/analytics/churn/${owner}/${repo}`);
        setChurnData(res.data);
      } catch (err) {
        setError('Failed to fetch code churn stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchChurn();
  }, [owner, repo]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Calculating file modifications and code churn metrics...</p></div>;
  if (error) return <div className="error-card">{error}</div>;

  // Format data for Treemap (Recharts Treemap expects 'name' and 'size')
  const formattedData = churnData.map(item => ({
    name: item.filename,
    size: item.churnScore,
    path: item.path
  }));

  // Custom Content Renderer for Treemap to control colors (Intensity)
  const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, name, size } = props;
    
    // Color mapping: higher score = red, lower score = green
    const getColor = (val) => {
      if (val > 600) return '#ff5555';
      if (val > 300) return '#ffb703';
      return '#39d353';
    };

    const color = getColor(size);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: 'var(--bg)',
            strokeWidth: 1,
            fillOpacity: 0.85,
          }}
        />
        {width > 40 && height > 20 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 3}
            textAnchor="middle"
            fill="black"
            fontSize={11}
            fontWeight="bold"
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card glass-panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="#ffb703" /> Code Churn Treemap
        </h3>
        <p className="score-desc" style={{ marginBottom: '16px' }}>
          Tree size indicates the total additions and deletions in the file. Green is stable, Yellow is active, Red is hot churn.
        </p>

        {formattedData.length > 0 ? (
          <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
            <ResponsiveContainer>
              <Treemap
                data={formattedData}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="var(--accent)"
                content={<CustomizedContent />}
              />
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted">No files scanned for churn.</p>
        )}
      </div>

      {/* File churn list */}
      <div className="card glass-panel">
        <h3>Churn Breakdown by File</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {churnData.map((file, idx) => (
            <div 
              key={idx} 
              className="stale-branch-card glass-panel" 
              style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setSelectedFile(file)}
            >
              <span className="risky-file-path" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <File size={14} /> {file.filename}
              </span>
              <span style={{ 
                fontWeight: '700', 
                color: file.churnScore > 600 ? '#ff5555' : (file.churnScore > 300 ? '#ffb703' : '#39d353') 
              }}>
                {file.churnScore} lines
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedFile && (
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3>File Details: {selectedFile.filename}</h3>
          <p style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace', color: 'var(--muted)' }}>Path: {selectedFile.path}</p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Total lines modified (additions + deletions) in analyzed commit batch: <strong>{selectedFile.churnScore} lines</strong>.
          </p>
          <button className="demo-btn" onClick={() => setSelectedFile(null)} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Close</button>
        </div>
      )}
    </div>
  );
}
