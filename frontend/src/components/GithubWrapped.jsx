/**
 * GithubWrapped Component
 * Generates a yearly summary showcase of developer contributions, top languages,
 * and coding streaks, inspired by Spotify Wrapped.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, ChevronRight, Share2, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function GithubWrapped({ owner, repo }) {
  const [loading, setLoading] = useState(false);
  const [wrapped, setWrapped] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchWrapped = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${BACKEND_URL}/api/social/wrapped/${owner}/${repo}?year=2024`);
        setWrapped(res.data);
      } catch (err) {
        setError('Failed to fetch Wrapped insights.');
      } finally {
        setLoading(false);
      }
    };

    fetchWrapped();
  }, [owner, repo]);

  // Handle slide rotation timer
  useEffect(() => {
    if (!isPlaying || !wrapped) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPlaying, wrapped]);

  if (loading) return <div className="health-loading"><div className="spinner"></div><p>Calculating your repository wrapped summaries...</p></div>;
  if (error) return <div className="error-card">{error}</div>;
  if (!wrapped) return null;

  const slides = [
    {
      title: 'A massive year of updates!',
      val: wrapped.totalCommits,
      sub: 'Total Commits in 2024',
      bg: 'linear-gradient(135deg, #c644fc, #5856d6)',
      desc: 'You kept pushing code forward, build by build, patch by patch!'
    },
    {
      title: 'Your busiest month was...',
      val: wrapped.mostActiveMonth,
      sub: 'Peak Commit Output Month',
      bg: 'linear-gradient(135deg, #ff5555, #ffb703)',
      desc: 'The keyboard was hot, and pull request approvals were flying!'
    },
    {
      title: 'The MVP Contributor',
      val: wrapped.topContributor,
      sub: 'Top Contributor of the Year',
      bg: 'linear-gradient(135deg, #39d353, #06b6d4)',
      desc: 'Leading the charge, shipping features, and squashing bugs.'
    },
    {
      title: 'Most Changed File',
      val: wrapped.mostChangedFile.split('/').pop(),
      sub: 'Highest Modification Count',
      bg: 'linear-gradient(135deg, #ffb703, #ff7733)',
      desc: 'The single file that saw the most lines of modifications.'
    },
    {
      title: 'Longest Consecutive Run',
      val: `${wrapped.longestStreak} days`,
      sub: 'Commit Streak Length',
      bg: 'linear-gradient(135deg, #5856d6, #c644fc)',
      desc: 'Consistency is key. You worked day after day without breaking stride.'
    },
    {
      title: 'Your favorite commit word',
      val: `"${wrapped.mostUsedWord}"`,
      sub: 'Most Used Word in Commit Messages',
      bg: 'linear-gradient(135deg, #06b6d4, #39d353)',
      desc: 'It tells the story of your year. You spent a lot of time focusing here.'
    }
  ];

  const shareWrapped = () => {
    const text = `Just loaded GitHub Wrapped 2024 for ${owner}/${repo}! Total Commits: ${wrapped.totalCommits}, MVP: ${wrapped.topContributor}, Longest Streak: ${wrapped.longestStreak} days. Check yours on Git Repo Analyzer! 🌟`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const active = slides[currentSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      {/* Wrapped Slide Player */}
      <div 
        onClick={() => setCurrentSlide(prev => (prev + 1) % 6)}
        className="card glass-panel text-center" 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          height: '420px', 
          background: active.bg, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          padding: '36px',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          transition: 'all 0.5s ease',
          color: 'black'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', opacity: 0.8 }}>
          <span>{owner}/{repo}</span>
          <span>WRAPPED 2024</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.2px' }}>{active.title}</span>
          <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '10px 0', lineHeight: 1, letterSpacing: '-2px', wordBreak: 'break-all' }}>
            {active.val}
          </h1>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>{active.sub}</span>
        </div>

        <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5, fontWeight: '600', opacity: 0.9 }}>
          {active.desc}
        </p>
      </div>

      {/* Progress indicators */}
      <div style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '450px' }}>
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            onClick={() => setCurrentSlide(idx)}
            style={{ 
              height: '4px', 
              flex: 1, 
              backgroundColor: idx === currentSlide ? 'white' : 'rgba(255,255,255,0.15)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          />
        ))}
      </div>

      {/* Play/Pause/Share Panel */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
        <button onClick={() => setIsPlaying(!isPlaying)} className="copy-btn">
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Autoplay'}
        </button>
        <button onClick={shareWrapped} className="copy-btn" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {copied ? <Check size={14} className="copied" /> : <Share2 size={14} />}
          {copied ? 'Copied summary!' : 'Share Wrapped'}
        </button>
      </div>
    </div>
  );
}
