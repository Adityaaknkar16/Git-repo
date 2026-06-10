import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

export default function TimelinePlayback({ commits, onFilteredCommitsChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1000); // ms per step
  const timerRef = useRef(null);

  // Sort commits from oldest to newest for chronological playback
  const chronologicalCommits = [...commits].reverse();

  useEffect(() => {
    // Notify parent of slice of commits corresponding to the active index
    const activeCommits = chronologicalCommits.slice(0, currentIndex + 1).reverse();
    onFilteredCommitsChange(activeCommits);
  }, [currentIndex, commits]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= chronologicalCommits.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, chronologicalCommits.length]);

  const handlePlayPause = () => {
    if (currentIndex >= chronologicalCommits.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(chronologicalCommits.length - 1); // show all by default
  };

  const activeCommit = chronologicalCommits[currentIndex] || {};

  return (
    <div className="timeline-playback-container glass-panel">
      <div className="playback-controls">
        <button className="control-btn" onClick={handlePlayPause}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button className="control-btn" onClick={handleReset}>
          <RotateCcw size={16} />
        </button>
        
        <div className="slider-wrapper">
          <input 
            type="range" 
            min="0" 
            max={chronologicalCommits.length - 1} 
            value={currentIndex} 
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(Number(e.target.value));
            }}
            className="timeline-slider"
          />
        </div>

        <div className="speed-selector">
          <FastForward size={14} className="icon" />
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value="1500">Slow</option>
            <option value="1000">Normal</option>
            <option value="400">Fast</option>
          </select>
        </div>
      </div>

      {activeCommit.sha && (
        <div className="current-playback-status">
          <span className="date-tag">{new Date(activeCommit.date).toLocaleDateString()}</span>
          <span className="sha-tag">{activeCommit.sha}</span>
          <span className="msg-tag">{activeCommit.message}</span>
        </div>
      )}

      <style>{`
        .timeline-playback-container {
          padding: 12px 16px;
          background: #17171e;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .playback-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .control-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #23232b;
          border: 1px solid var(--border);
          border-radius: 50%;
          color: var(--text);
          cursor: pointer;
          transition: background 0.2s;
        }
        .control-btn:hover {
          background: var(--accent);
          color: white;
        }
        .slider-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          min-width: 150px;
        }
        .timeline-slider {
          width: 100%;
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #2b2b36;
          outline: none;
        }
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
        }
        .speed-selector {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--muted);
        }
        .speed-selector select {
          padding: 4px 8px;
          border-radius: 6px;
          background: #23232b;
          border: 1px solid var(--border);
          color: var(--text);
        }
        .current-playback-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          background: #0f0f13;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .date-tag {
          color: #39d353;
          font-weight: 600;
          flex-shrink: 0;
        }
        .sha-tag {
          font-family: monospace;
          background: #23232b;
          padding: 1px 4px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .msg-tag {
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
