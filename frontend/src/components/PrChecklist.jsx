import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckSquare, Square, FileText } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function PrChecklist({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [language, setLanguage] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchChecklist = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/tools/pr-checklist/${owner}/${repo}`);
        setChecklist(res.data.checklist);
        setLanguage(res.data.language);
      } catch (err) {
        setError('Failed to load review checklists.');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [owner, repo]);

  const toggleCheck = (itemText) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const downloadMarkdown = () => {
    if (checklist.length === 0) return;
    
    let md = `# Pull Request Review Checklist: ${owner}/${repo}\n`;
    md += `Primary Language: **${language}**\n\n`;

    checklist.forEach(cat => {
      md += `## ${cat.category}\n`;
      cat.items.forEach(item => {
        const isChecked = checkedItems[item] ? '[x]' : '[ ]';
        md += `- ${isChecked} ${item}\n`;
      });
      md += '\n';
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PR_REVIEW_CHECKLIST.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Compiling review checklists for primary language...</p></div>;
  if (error) return <div className="error-card">{error}</div>;

  return (
    <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>PR Review Checklist Generator</h2>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            Interactive checklist for reviewing PR code based on primary language best practices.
          </p>
        </div>
        <button className="copy-btn" onClick={downloadMarkdown} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={14} /> Export as Markdown
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
        {checklist.map((cat, catIdx) => (
          <div key={catIdx} className="issue-card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent)', fontSize: '15px', fontWeight: '700' }}>
              {cat.category}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cat.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleCheck(item)}
                >
                  <div style={{ marginTop: '2px', color: checkedItems[item] ? '#39d353' : 'var(--muted)' }}>
                    {checkedItems[item] ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span style={{ 
                    fontSize: '13px', 
                    color: checkedItems[item] ? 'var(--muted)' : 'var(--text)',
                    textDecoration: checkedItems[item] ? 'line-through' : 'none' 
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
