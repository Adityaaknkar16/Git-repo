/**
 * RepoReportCard Component
 * Renders a shareable, high-fidelity report card detailing grade level,
 * maintenance indexes, and performance metrics for the repository.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { FileDown, Calendar, Award } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function RepoReportCard({ owner, repo, stats }) {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchReportCard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.post(`${BACKEND_URL}/api/social/report-card/${owner}/${repo}`, {
          healthScore: stats?.healthScore || 85,
          busFactor: stats?.busFactor || 2,
          contributorCount: stats?.contributorCount || 3,
          commitFrequency: stats?.commitFrequency || 20,
          primaryLanguage: stats?.primaryLanguage || 'JavaScript',
          topContributor: stats?.topContributor || 'LeadCoder'
        });
        setCardData(res.data);
      } catch (err) {
        setError('Failed to generate report card metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportCard();
  }, [owner, repo, stats]);

  const handleDownloadPDF = () => {
    const input = document.getElementById('report-card-pdf-area');
    if (!input) return;

    html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#0b0b0e' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${owner}_${repo}_report_card.pdf`);
    });
  };

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Generating report card grades...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!cardData) return null;

  const { grades, stats: reportStats, date } = cardData;

  const getGradeColor = (g) => {
    if (g === 'A') return '#39d353';
    if (g === 'B') return '#a8a6ff';
    if (g === 'C') return '#ffb703';
    return '#ff5555';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <button className="battle-btn-large" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'center' }}>
        <FileDown size={18} /> Export Report Card as PDF
      </button>

      {/* PDF Target Area */}
      <div 
        id="report-card-pdf-area" 
        className="card glass-panel" 
        style={{ 
          maxWidth: '650px', 
          margin: '0 auto', 
          padding: '40px', 
          background: '#0b0b0e', 
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          color: 'white'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              REPOSITORY REPORT CARD
            </h1>
            <span style={{ fontSize: '18px', fontWeight: '800', display: 'block', marginTop: '6px' }}>{cardData.repoName}</span>
            <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
              <Calendar size={12} /> Date Generated: {date}
            </span>
          </div>
          <QRCodeSVG 
            value={`https://github.com/${owner}/${repo}`} 
            size={60} 
            bgColor="#0b0b0e" 
            fgColor="#f3f3f6" 
            level="L"
            style={{ border: '1px solid var(--border)', padding: '4px', borderRadius: '4px' }}
          />
        </div>

        {/* Big Overall Grade */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Overall Rating</span>
            <h2 style={{ fontSize: '72px', margin: '4px 0 0', fontWeight: '800', color: getGradeColor(grades.overall), lineHeight: 1 }}>
              {grades.overall}
            </h2>
          </div>
          <div style={{ maxWidth: '250px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            This grade represents the aggregated activity, health levels, and team structure evaluated for this codebase.
          </div>
        </div>

        {/* Breakdown Card Grades */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="issue-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '14px' }}>Knowledge Distribution</strong>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Bus Factor: {reportStats.busFactor}</div>
            </div>
            <strong style={{ fontSize: '28px', color: getGradeColor(grades.knowledgeSharing) }}>{grades.knowledgeSharing}</strong>
          </div>

          <div className="issue-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '14px' }}>Commit Frequency</strong>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{reportStats.commitFrequency} commits/week</div>
            </div>
            <strong style={{ fontSize: '28px', color: getGradeColor(grades.activity) }}>{grades.activity}</strong>
          </div>

          <div className="issue-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '14px' }}>Collaboration Level</strong>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{reportStats.contributorCount} contributors</div>
            </div>
            <strong style={{ fontSize: '28px', color: getGradeColor(grades.collaboration) }}>{grades.collaboration}</strong>
          </div>

          <div className="issue-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(88,86,214,0.05)' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#a8a6ff' }}>Primary Language</strong>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{reportStats.primaryLanguage}</div>
            </div>
            <strong style={{ fontSize: '14px', color: 'white', maxWidth: '80px', textAlign: 'right', wordBreak: 'break-all' }}>{reportStats.topContributor}</strong>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', fontSize: '11px', color: 'var(--muted)' }}>
          Powered by Git Repository Analyzer &bull; Adityaaknkar16/Git-repo
        </div>
      </div>
    </div>
  );
}
