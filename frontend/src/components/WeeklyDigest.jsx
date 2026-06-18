import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Check, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function WeeklyDigest({ repoUrl }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !repoUrl) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${BACKEND_URL}/api/enterprise/digest/subscribe`, { email, repoUrl });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to subscribe to digest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Mail size={18} color="var(--accent)" /> Weekly Email Digest
      </h3>
      <p className="score-desc">
        Receive a automated health briefing every Monday containing commit updates, PR speeds, and collaborator contributions.
      </p>

      {success ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#39d353', fontSize: '13px', fontWeight: '700', marginTop: '10px' }}>
          <Check size={16} /> Successfully subscribed to weekly digests!
        </div>
      ) : (
        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input 
            type="email" 
            placeholder="dev@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              flex: 1, 
              padding: '10px 12px', 
              fontSize: '13px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 16px', 
              fontSize: '13px', 
              fontWeight: '700', 
              borderRadius: '8px', 
              background: 'var(--gradient)', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff5555', fontSize: '12px', marginTop: '6px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
