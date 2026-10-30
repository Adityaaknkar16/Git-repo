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
          padding: 14px 18px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0px #000000;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .playback-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .control-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          color: #000000;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.1s ease;
        }
        .control-btn:hover {
          background: #000000;
          color: #ffffff;
          transform: translate(-1px, -1px);
        }
        .control-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px #000000;
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
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          border: 1px solid #000000;
          outline: none;
        }
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #000000;
          border: 2px solid #000000;
          cursor: pointer;
          box-shadow: 1px 1px 0px #000000;
        }
        .speed-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #000000;
        }
        .speed-selector .icon {
          color: #000000;
        }
        .speed-selector select {
          padding: 6px 12px;
          border-radius: 4px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          color: #000000;
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
        }
        .current-playback-status {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          background: #ffffff;
          padding: 8px 14px;
          border-radius: 4px;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          overflow: hidden;
        }
        .date-tag {
          color: #ffffff;
          background: #000000;
          font-family: monospace;
          font-weight: 800;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 2px;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .sha-tag {
          font-family: monospace;
          background: #f0f0f0;
          color: #000000;
          border: 1px solid #000000;
          padding: 2px 8px;
          border-radius: 2px;
          font-weight: 800;
          font-size: 12px;
          flex-shrink: 0;
        }
        .msg-tag {
          color: #000000;
          font-weight: 700;
          font-family: monospace;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
