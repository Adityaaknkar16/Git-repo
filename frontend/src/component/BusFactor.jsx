import React from 'react';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

export default function BusFactor({ busFactorInfo }) {
  if (!busFactorInfo) return null;

  const { busFactor, busFactorRiskGauge, riskyFiles } = busFactorInfo;

  // Determine risk level text and colors
  const getRiskDetails = (gauge) => {
    switch (gauge) {
      case 5:
        return { label: 'CRITICAL', color: '#ff5555', desc: 'Extreme dependency on 1-2 core developers. Highly vulnerable.' };
      case 4:
        return { label: 'HIGH RISK', color: '#ff7733', desc: 'Significant bottleneck. Loss of core devs will halt progress.' };
      case 3:
        return { label: 'MODERATE', color: '#ffb703', desc: 'Moderate knowledge distribution. Some key files depend on single devs.' };
      case 2:
        return { label: 'LOW RISK', color: '#a8a6ff', desc: 'Good knowledge distribution across multiple team members.' };
      case 1:
      default:
        return { label: 'MINIMAL RISK', color: '#39d353', desc: 'Excellent collaborative overlap. Strong knowledge sharing.' };
    }
  };

  const risk = getRiskDetails(busFactorRiskGauge);

  return (
    <div className="bus-factor-section" style={{ width: '100%' }}>
      {/* Red Warning Banner for busFactor <= 2 */}
      {busFactor <= 2 && (
        <div className="bus-factor-banner">
          <div className="bus-icon-container">
            <ShieldAlert size={28} />
          </div>
          <div className="bus-text">
            <h4>Critical Bus Factor Warning! (Bus Factor = {busFactor})</h4>
            <p>
              A minimum of only <strong>{busFactor}</strong> {busFactor === 1 ? 'developer covers' : 'developers cover'} 80% of all commits. 
              If {busFactor === 1 ? 'this developer leaves' : 'these developers leave'} the project, 
              there is a high risk of project failure due to loss of critical knowledge.
            </p>
          </div>
        </div>
      )}

      <div className="grid">
        {/* Risk Gauge */}
        <div className="card gauge-card glass-panel">
          <h3>Knowledge Risk Gauge</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: risk.color, marginTop: '10px' }}>
            {risk.label}
          </div>
          <p className="score-desc" style={{ textAlign: 'center', marginBottom: '16px' }}>
            {risk.desc}
          </p>

          <div className="gauge-bar-container">
            <div 
              className="gauge-marker" 
              style={{ 
                width: `${(busFactorRiskGauge / 5) * 100}%`, 
                backgroundColor: risk.color,
                boxShadow: `0 0 10px ${risk.color}bb`
              }} 
            />
          </div>
          <div className="gauge-ticks">
            <span>Minimal</span>
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Risky Files List */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>High Ownership Files (&gt;75% changes)</h3>
          <p className="score-desc" style={{ marginBottom: '16px' }}>
            The following files are heavily dominated by a single contributor.
          </p>
          
          <div className="risky-files-list">
            {riskyFiles && riskyFiles.length > 0 ? (
              riskyFiles.map((file, idx) => (
                <div key={idx} className="risky-file-item">
                  <span className="risky-file-path" title={file.path}>
                    {file.path.split('/').pop()}
                  </span>
                  <span className="risky-file-owner">
                    {file.owner} ({file.ownershipPercentage}%)
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted" style={{ fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                🎉 Excellent! No files found with single-author ownership exceeding 75%.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
