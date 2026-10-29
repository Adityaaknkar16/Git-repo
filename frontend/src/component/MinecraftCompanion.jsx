import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageSquare, ChevronUp, ChevronDown, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';

// Web Audio API Retro 8-bit sound generator (Zero external dependencies)
function playRetroTone(freq = 440, type = 'square', duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context may be blocked by browser policy until gesture
  }
}

// Minecraft quotes tailored for developers & Git
const MINECRAFT_TIPS = [
  "Mining your commit history... Found diamonds! 💎",
  "Watch out! Don't let merge conflicts creep up on you! 💥",
  "That codebase is deeper than bedrock! ⛏️",
  "Remember: Never dig straight down into node_modules!",
  "Crafting a high-velocity pull request! 📜",
  "Enchanting your codebase with 100% test coverage! ✨",
  "Steve says: Commit early, push often, eat cooked porkchops! 🍖",
  "Enderman spotted moving your branch pointers around! 🔮",
  "Your repository health is looking at full 10 hearts! ❤️",
  "Building robust monolithic structures, block by block! 🧱"
];

// Pixel Art Characters represented as SVG Grid
export function MinecraftPixelCharacter({ character = 'steve', action = 'idle', size = 64 }) {
  // 16x32 pixel representation
  const renderCharacterPixels = () => {
    switch (character) {
      case 'alex':
        return (
          <g>
            {/* Hair - Orange */}
            <rect x="4" y="0" width="8" height="2" fill="#d97724" />
            <rect x="3" y="1" width="10" height="3" fill="#d97724" />
            <rect x="3" y="4" width="2" height="4" fill="#d97724" />
            <rect x="11" y="4" width="2" height="3" fill="#d97724" />
            {/* Face - Peach */}
            <rect x="5" y="2" width="6" height="5" fill="#fcd7b0" />
            {/* Eyes - Green */}
            <rect x="5" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="6" y="4" width="1" height="1" fill="#22c55e" />
            <rect x="9" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="4" width="1" height="1" fill="#22c55e" />
            {/* Nose & Mouth */}
            <rect x="7" y="5" width="2" height="1" fill="#e2a679" />
            <rect x="6" y="6" width="4" height="1" fill="#b45309" />
            {/* Torso - Green Tunic */}
            <rect x="4" y="8" width="8" height="10" fill="#5b8731" />
            <rect x="4" y="16" width="8" height="2" fill="#3f2e18" />
            {/* Arms - Skin & Green sleeves */}
            <rect x="1" y="8" width="3" height="3" fill="#5b8731" />
            <rect x="1" y="11" width="3" height="7" fill="#fcd7b0" />
            <rect x="12" y="8" width="3" height="3" fill="#5b8731" />
            <rect x="12" y="11" width="3" height="7" fill="#fcd7b0" />
            {/* Legs - Brown Pants */}
            <rect x="4" y="18" width="4" height="10" fill="#4a3728" />
            <rect x="8" y="18" width="4" height="10" fill="#4a3728" />
            {/* Boots - Darker brown */}
            <rect x="4" y="28" width="4" height="4" fill="#2d1f14" />
            <rect x="8" y="28" width="4" height="4" fill="#2d1f14" />
          </g>
        );
      case 'creeper':
        return (
          <g>
            {/* Head - Green shades */}
            <rect x="4" y="0" width="8" height="8" fill="#4ade80" />
            <rect x="4" y="2" width="2" height="2" fill="#22c55e" />
            <rect x="10" y="4" width="2" height="2" fill="#15803d" />
            <rect x="7" y="1" width="2" height="2" fill="#86efac" />
            {/* Creeper Face Features - Black */}
            <rect x="5" y="2" width="2" height="2" fill="#050505" />
            <rect x="9" y="2" width="2" height="2" fill="#050505" />
            <rect x="7" y="4" width="2" height="2" fill="#050505" />
            <rect x="6" y="5" width="4" height="3" fill="#050505" />
            <rect x="6" y="8" width="1" height="1" fill="#050505" />
            <rect x="9" y="8" width="1" height="1" fill="#050505" />
            {/* Body */}
            <rect x="5" y="8" width="6" height="12" fill="#22c55e" />
            <rect x="6" y="10" width="2" height="3" fill="#15803d" />
            <rect x="8" y="14" width="2" height="2" fill="#4ade80" />
            {/* 4 Feet */}
            <rect x="4" y="20" width="3" height="10" fill="#16a34a" />
            <rect x="9" y="20" width="3" height="10" fill="#16a34a" />
            <rect x="4" y="28" width="3" height="2" fill="#052e16" />
            <rect x="9" y="28" width="3" height="2" fill="#052e16" />
          </g>
        );
      case 'diamond':
        return (
          <g>
            {/* Diamond Helmet - Cyan #38bdf8 */}
            <rect x="3" y="0" width="10" height="7" fill="#38bdf8" />
            <rect x="3" y="0" width="10" height="2" fill="#0284c7" />
            <rect x="3" y="5" width="3" height="3" fill="#38bdf8" />
            <rect x="10" y="5" width="3" height="3" fill="#38bdf8" />
            {/* Face Peek */}
            <rect x="6" y="2" width="4" height="4" fill="#c48a5c" />
            <rect x="6" y="3" width="1" height="1" fill="#1d4ed8" />
            <rect x="9" y="3" width="1" height="1" fill="#1d4ed8" />
            {/* Diamond Chestplate */}
            <rect x="3" y="7" width="10" height="11" fill="#38bdf8" />
            <rect x="5" y="8" width="6" height="4" fill="#7dd3fc" />
            <rect x="1" y="8" width="3" height="10" fill="#38bdf8" />
            <rect x="12" y="8" width="3" height="10" fill="#38bdf8" />
            {/* Diamond Sword in Hand */}
            <rect x="14" y="4" width="2" height="12" fill="#38bdf8" />
            <rect x="13" y="12" width="4" height="2" fill="#0284c7" />
            <rect x="14" y="14" width="2" height="3" fill="#78350f" />
            {/* Diamond Leggings & Boots */}
            <rect x="4" y="18" width="4" height="10" fill="#0284c7" />
            <rect x="8" y="18" width="4" height="10" fill="#0284c7" />
            <rect x="4" y="26" width="4" height="6" fill="#38bdf8" />
            <rect x="8" y="26" width="4" height="6" fill="#38bdf8" />
          </g>
        );
      case 'enderman':
        return (
          <g>
            {/* Head - Pitch Black #121214 */}
            <rect x="4" y="0" width="8" height="8" fill="#121214" />
            {/* Purple Eyes */}
            <rect x="4" y="3" width="3" height="1" fill="#c084fc" />
            <rect x="5" y="3" width="1" height="1" fill="#f43f5e" />
            <rect x="9" y="3" width="3" height="1" fill="#c084fc" />
            <rect x="10" y="3" width="1" height="1" fill="#f43f5e" />
            {/* Long Slim Body */}
            <rect x="6" y="8" width="4" height="12" fill="#09090b" />
            {/* Long Slim Arms */}
            <rect x="3" y="8" width="2" height="18" fill="#121214" />
            <rect x="11" y="8" width="2" height="18" fill="#121214" />
            {/* Very Long Slim Legs */}
            <rect x="6" y="20" width="2" height="12" fill="#09090b" />
            <rect x="8" y="20" width="2" height="12" fill="#09090b" />
          </g>
        );
      case 'steve':
      default:
        return (
          <g>
            {/* Hair - Dark Brown */}
            <rect x="4" y="0" width="8" height="2" fill="#4a2e18" />
            <rect x="3" y="1" width="10" height="2" fill="#4a2e18" />
            <rect x="3" y="3" width="2" height="3" fill="#4a2e18" />
            <rect x="11" y="3" width="2" height="3" fill="#4a2e18" />
            {/* Face - Tan */}
            <rect x="5" y="2" width="6" height="5" fill="#c48a5c" />
            {/* Eyes - White & Blue */}
            <rect x="5" y="3" width="2" height="1" fill="#ffffff" />
            <rect x="6" y="3" width="1" height="1" fill="#2563eb" />
            <rect x="9" y="3" width="2" height="1" fill="#ffffff" />
            <rect x="9" y="3" width="1" height="1" fill="#2563eb" />
            {/* Nose & Beard */}
            <rect x="7" y="4" width="2" height="1" fill="#a16239" />
            <rect x="6" y="5" width="4" height="1" fill="#693e1b" />
            <rect x="5" y="6" width="6" height="1" fill="#4a2e18" />
            {/* Shirt - Cyan Blue */}
            <rect x="4" y="7" width="8" height="10" fill="#06b6d4" />
            {/* Arms - Skin & Cyan Sleeve */}
            <g className={action === 'walk' ? 'arm-left-swing' : ''}>
              <rect x="1" y="7" width="3" height="3" fill="#06b6d4" />
              <rect x="1" y="10" width="3" height="7" fill="#c48a5c" />
            </g>
            <g className={action === 'walk' ? 'arm-right-swing' : ''}>
              <rect x="12" y="7" width="3" height="3" fill="#06b6d4" />
              <rect x="12" y="10" width="3" height="7" fill="#c48a5c" />
              {/* Optional Pickaxe */}
              <rect x="14" y="12" width="2" height="7" fill="#78350f" />
              <rect x="13" y="10" width="4" height="2" fill="#38bdf8" />
            </g>
            {/* Pants - Indigo */}
            <rect x="4" y="17" width="4" height="9" fill="#1e3a8a" />
            <rect x="8" y="17" width="4" height="9" fill="#1e3a8a" />
            {/* Shoes - Gray */}
            <rect x="4" y="26" width="4" height="4" fill="#475569" />
            <rect x="8" y="26" width="4" height="4" fill="#475569" />
          </g>
        );
    }
  };

  return (
    <svg 
      viewBox="0 0 16 32" 
      width={size} 
      height={size * 2} 
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      className={`minecraft-avatar ${action}`}
    >
      {renderCharacterPixels()}
    </svg>
  );
}

// Minecraft 10-Heart Pixel Health Bar Component
export function MinecraftHealthBar({ score = 80 }) {
  // Score 0-100 mapped to 10 hearts (each heart = 10 pts, full or half)
  const totalHearts = 10;
  const filledPoints = Math.round(score / 5); // 0 to 20 half-hearts

  const hearts = [];
  for (let i = 0; i < totalHearts; i++) {
    const heartVal = filledPoints - i * 2;
    if (heartVal >= 2) {
      hearts.push('full');
    } else if (heartVal === 1) {
      hearts.push('half');
    } else {
      hearts.push('empty');
    }
  }

  return (
    <div className="minecraft-health-bar" title={`Health: ${score}% (${hearts.filter(h => h === 'full').length} Hearts)`}>
      <div className="hearts-row">
        {hearts.map((type, idx) => (
          <svg key={idx} width="16" height="16" viewBox="0 0 9 9" className="minecraft-heart">
            {/* Heart Background / Border */}
            <path d="M1 2h2v1H1zM3 1h3v1H3zM6 2h2v1H6zM0 3h1v3H0zM8 3h1v3H8zM1 6h1v1H1zM7 6h1v1H7zM2 7h1v1H2zM6 7h1v1H6zM3 8h3v1H3z" fill="#000000" />
            <rect x="1" y="3" width="7" height="3" fill="#2d0505" />
            {type === 'full' && (
              <g>
                <rect x="1" y="2" width="2" height="1" fill="#e11d48" />
                <rect x="6" y="2" width="2" height="1" fill="#e11d48" />
                <rect x="1" y="3" width="7" height="3" fill="#e11d48" />
                <rect x="2" y="6" width="5" height="1" fill="#e11d48" />
                <rect x="3" y="7" width="3" height="1" fill="#e11d48" />
                {/* Shiny White Pixel */}
                <rect x="2" y="3" width="1" height="1" fill="#ffffff" />
              </g>
            )}
            {type === 'half' && (
              <g>
                <rect x="1" y="2" width="2" height="1" fill="#e11d48" />
                <rect x="1" y="3" width="4" height="3" fill="#e11d48" />
                <rect x="2" y="6" width="3" height="1" fill="#e11d48" />
                <rect x="3" y="7" width="2" height="1" fill="#e11d48" />
                <rect x="2" y="3" width="1" height="1" fill="#ffffff" />
              </g>
            )}
          </svg>
        ))}
      </div>
      <span className="health-badge">{score}% HP</span>
      <style>{`
        .minecraft-health-bar {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #000000;
          padding: 6px 12px;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          image-rendering: pixelated;
        }
        .hearts-row {
          display: flex;
          gap: 3px;
        }
        .minecraft-heart {
          image-rendering: pixelated;
          filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.5));
        }
        .health-badge {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}

// Minecraft Experience / Level Bar
export function MinecraftExpBar({ level = 42, progress = 65 }) {
  return (
    <div className="minecraft-exp-container" title={`Developer EXP Level ${level}`}>
      <div className="exp-bar-frame">
        <div className="exp-bar-fill" style={{ width: `${Math.min(100, Math.max(5, progress))}%` }} />
      </div>
      <div className="exp-level-number">{level}</div>
      <style>{`
        .minecraft-exp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 100%;
          max-width: 280px;
          margin: 4px auto;
        }
        .exp-bar-frame {
          width: 100%;
          height: 8px;
          background: #18181b;
          border: 1px solid #000000;
          box-shadow: 0 0 0 1px #3f3f46;
          position: relative;
          overflow: hidden;
        }
        .exp-bar-fill {
          height: 100%;
          background: #22c55e;
          box-shadow: inset 0 1px 0 #86efac;
          transition: width 0.4s ease;
        }
        .exp-level-number {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #84cc16;
          text-shadow: 1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000;
          position: absolute;
          top: -10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default function MinecraftCompanion({ activeTab = 'overview', repoName = '' }) {
  const [character, setCharacter] = useState('steve');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [action, setAction] = useState('idle');
  const [particles, setParticles] = useState([]);

  // Cycle quote based on tab change or click
  useEffect(() => {
    const nextIdx = Math.floor(Math.random() * MINECRAFT_TIPS.length);
    setQuoteIndex(nextIdx);
  }, [activeTab]);

  const handleCharacterClick = () => {
    // Play retro blip
    if (soundEnabled) {
      playRetroTone(587.33, 'square', 0.08); // D5
      setTimeout(() => playRetroTone(880, 'square', 0.1), 80); // A5
    }

    // Trigger action animation
    setAction('walk');
    setTimeout(() => setAction('idle'), 1200);

    // Next quote
    setQuoteIndex((prev) => (prev + 1) % MINECRAFT_TIPS.length);

    // Spawn heart/diamond particles
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -Math.random() * 50 - 20,
      icon: ['💎', '❤️', '⛏️', '✨', '🟩'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  const charactersList = [
    { id: 'steve', name: 'Steve (Classic)', icon: '⛏️' },
    { id: 'alex', name: 'Alex (Survival)', icon: '🏹' },
    { id: 'diamond', name: 'Diamond Knight', icon: '💎' },
    { id: 'creeper', name: 'Creeper', icon: '💥' },
    { id: 'enderman', name: 'Enderman', icon: '🔮' }
  ];

  return (
    <div className={`minecraft-companion-widget ${isMinimized ? 'minimized' : ''}`}>
      {/* Particle Overlay */}
      {particles.map(p => (
        <span 
          key={p.id} 
          className="minecraft-particle" 
          style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
        >
          {p.icon}
        </span>
      ))}

      {!isMinimized && (
        <div className="speech-bubble-wrapper">
          <div className="speech-bubble neo-brutalist">
            <div className="bubble-header">
              <span className="character-name-tag">
                {character.toUpperCase()} · GIT COMPANION
              </span>
              <div className="bubble-controls">
                <button 
                  className="icon-mini-btn" 
                  onClick={() => setSoundEnabled(!soundEnabled)} 
                  title={soundEnabled ? "Mute Retro Sounds" : "Enable Retro Sounds"}
                >
                  {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </button>
                <button 
                  className="icon-mini-btn" 
                  onClick={() => setIsMinimized(true)} 
                  title="Minimize Companion"
                >
                  <Minimize2 size={12} />
                </button>
              </div>
            </div>
            <p className="bubble-text">
              "{MINECRAFT_TIPS[quoteIndex]}"
            </p>
            {repoName && (
              <div className="repo-mine-badge">
                <span>⛏️ Exploring: <strong>{repoName}</strong></span>
              </div>
            )}
            <div className="bubble-actions">
              <button className="bubble-btn" onClick={handleCharacterClick}>
                <Sparkles size={11} /> Mine Insights
              </button>
              <select 
                value={character} 
                onChange={(e) => {
                  setCharacter(e.target.value);
                  if (soundEnabled) playRetroTone(440, 'triangle', 0.05);
                }}
                className="skin-select"
                title="Change Minecraft Skin"
              >
                {charactersList.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Character Avatar Container */}
      <div 
        className="character-avatar-stage neo-brutalist" 
        onClick={handleCharacterClick}
        title="Click to interact with your Minecraft companion!"
      >
        <MinecraftPixelCharacter character={character} action={action} size={isMinimized ? 28 : 42} />
        {isMinimized && (
          <button 
            className="maximize-btn" 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            title="Expand Companion"
          >
            <Maximize2 size={12} />
          </button>
        )}
      </div>

      <style>{`
        .minecraft-companion-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          font-family: 'Space Mono', monospace;
          pointer-events: auto;
          user-select: none;
        }

        .minecraft-particle {
          position: absolute;
          bottom: 60px;
          right: 30px;
          font-size: 18px;
          pointer-events: none;
          animation: floatParticle 1s ease-out forwards;
          z-index: 10000;
        }

        @keyframes floatParticle {
          0% { opacity: 1; transform: translate(0, 0) scale(0.6); }
          100% { opacity: 0; transform: translate(var(--tw-translate-x, 0), -60px) scale(1.3); }
        }

        .speech-bubble-wrapper {
          display: flex;
          flex-direction: column;
        }

        .speech-bubble.neo-brutalist {
          background: #ffffff;
          color: #000000;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          padding: 12px 14px;
          width: 270px;
          position: relative;
          border-radius: 0px;
        }

        .speech-bubble.neo-brutalist::after {
          content: '';
          position: absolute;
          right: -10px;
          bottom: 24px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 10px solid #000000;
        }

        .bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #000000;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }

        .character-name-tag {
          font-size: 10px;
          font-weight: 800;
          background: #000000;
          color: #ffffff;
          padding: 2px 6px;
          letter-spacing: 0.5px;
        }

        .bubble-controls {
          display: flex;
          gap: 4px;
        }

        .icon-mini-btn {
          background: transparent;
          border: 1px solid #000000;
          padding: 2px 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
        }
        .icon-mini-btn:hover {
          background: #000000;
          color: #ffffff;
        }

        .bubble-text {
          font-size: 12px;
          line-height: 1.4;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .repo-mine-badge {
          background: #f4f4f5;
          border: 1px dashed #000000;
          padding: 3px 6px;
          font-size: 10px;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bubble-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }

        .bubble-btn {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bubble-btn:hover {
          background: #ffffff;
          color: #000000;
        }

        .skin-select {
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          font-size: 10px;
          padding: 3px 4px;
          font-family: inherit;
          cursor: pointer;
        }

        .character-avatar-stage.neo-brutalist {
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          position: relative;
        }

        .character-avatar-stage.neo-brutalist:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000000;
        }

        .character-avatar-stage.neo-brutalist:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000000;
        }

        .maximize-btn {
          position: absolute;
          top: -8px;
          left: -8px;
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Minecraft Walking Animation */
        .minecraft-avatar.walk .arm-left-swing {
          animation: swingLeftArm 0.3s infinite alternate ease-in-out;
          transform-origin: 2px 8px;
        }
        .minecraft-avatar.walk .arm-right-swing {
          animation: swingRightArm 0.3s infinite alternate ease-in-out;
          transform-origin: 13px 8px;
        }

        @keyframes swingLeftArm {
          from { transform: rotate(-25deg); }
          to { transform: rotate(25deg); }
        }
        @keyframes swingRightArm {
          from { transform: rotate(25deg); }
          to { transform: rotate(-25deg); }
        }

        @media (max-width: 640px) {
          .minecraft-companion-widget {
            bottom: 12px;
            right: 12px;
          }
          .speech-bubble.neo-brutalist {
            width: 210px;
          }
        }
      `}</style>
    </div>
  );
}
