/**
 * DeveloperPersonas Component
 * Leverages contribution traits (docs, bugfixes, tests, UI) to classify authors
 * into descriptive archetypes.
 */
import React from 'react';
import { Share2 } from 'lucide-react';

export default function DeveloperPersonas({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return <p className="text-muted">No contributors found to analyze.</p>;
  }

  // Get color for each persona type
  const getPersonaBadgeStyle = (persona) => {
    switch (persona) {
      case 'Bug Slayer':
        return { backgroundColor: 'rgba(255, 85, 85, 0.15)', color: '#ff5555', border: '1px solid rgba(255, 85, 85, 0.3)' };
      case 'Architect':
        return { backgroundColor: 'rgba(198, 68, 252, 0.15)', color: '#c644fc', border: '1px solid rgba(198, 68, 252, 0.3)' };
      case 'Sprinter':
        return { backgroundColor: 'rgba(255, 183, 3, 0.15)', color: '#ffb703', border: '1px solid rgba(255, 183, 3, 0.3)' };
      case 'Lone Wolf':
        return { backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' };
      case 'Steady Builder':
      default:
        return { backgroundColor: 'rgba(57, 211, 83, 0.15)', color: '#39d353', border: '1px solid rgba(57, 211, 83, 0.3)' };
    }
  };

  const handleShareToTwitter = (login, persona) => {
    const tweetText = `Just analyzed our GitHub repository! Shout out to @${login}, our repo's designated "${persona}". Check it out on Git Repo Analyzer! 🚀 #GitHub #MERN #DevCommunity`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="personas-section">
      <div className="personas-grid">
        {contributors.map((c) => {
          const badgeStyle = getPersonaBadgeStyle(c.persona);
          return (
            <div key={c.login} className="persona-card glass-panel">
              <img 
                src={c.avatar_url} 
                alt={`${c.login}'s avatar`} 
                className="persona-avatar" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                }}
              />
              <div className="persona-name">{c.login}</div>
              <span className="persona-badge" style={badgeStyle}>
                {c.persona || 'Steady Builder'}
              </span>
              <div className="persona-stats">
                <div><strong>{c.contributions}</strong> commits</div>
                <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--muted)', minHeight: '32px' }}>
                  {c.reason || 'Consistently delivers steady updates to the codebase.'}
                </div>
              </div>
              <button 
                className="share-tw-btn" 
                onClick={() => handleShareToTwitter(c.login, c.persona || 'Steady Builder')}
              >
                <Share2 size={12} fill="white" /> Share on Twitter
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
