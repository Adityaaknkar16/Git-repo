import React, { useState } from 'react';
import { HelpCircle, ArrowRight, RotateCcw, Share2, Check } from 'lucide-react';

export default function PersonalityQuiz({ repoInfo, stats }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const questions = [
    {
      q: 'How would you describe the commit frequency of the repository?',
      options: [
        { text: 'A wild storm (Multiple commits every day)', score: 'rocket' },
        { text: 'A steady heartbeat (Few commits every week)', score: 'machine' },
        { text: 'Sporadic bursts (Long periods of silence, then massive updates)', score: 'hacker' },
        { text: 'Frozen in time (Rare updates or legacy commits only)', score: 'ghost' }
      ]
    },
    {
      q: 'What is the collaborative dynamic like inside the codebase?',
      options: [
        { text: 'A crowded marketplace (Dozens of active contributors)', score: 'legend' },
        { text: 'A small group of friends (2-4 developers in tight sync)', score: 'rocket' },
        { text: 'A lone ranger (1 developer doing absolutely everything)', score: 'hacker' },
        { text: 'An abandoned office (Nobody is checking issues or merging PRs)', score: 'ghost' }
      ]
    },
    {
      q: 'How quickly are Pull Requests merged and integrated?',
      options: [
        { text: 'Instantly (Automerge rules and rapid review speeds)', score: 'rocket' },
        { text: 'Carefully reviewed (Regular, daily review cycles)', score: 'machine' },
        { text: 'Slowly (PRs linger for weeks before action)', score: 'ghost' },
        { text: 'PRs? We commit directly to main!', score: 'hacker' }
      ]
    },
    {
      q: 'What is the state of issues and bug reporting in the tracker?',
      options: [
        { text: 'Resolved instantly (Excellent bug close rates)', score: 'legend' },
        { text: 'Organized and tagged (Steady issue resolution pacing)', score: 'machine' },
        { text: 'Piling up (Dozens of open issues with no replies)', score: 'ghost' },
        { text: 'Empty (We don\'t write bugs or don\'t track them)', score: 'hacker' }
      ]
    },
    {
      q: 'Is there a robust testing system or automation configured?',
      options: [
        { text: 'Yes, full CI/CD checks and testing coverages', score: 'machine' },
        { text: 'Basic setup (A few test specs here and there)', score: 'rocket' },
        { text: 'No tests (We test directly in production)', score: 'hacker' },
        { text: 'No documentation or tests whatsoever', score: 'ghost' }
      ]
    }
  ];

  const handleSelectOption = (score) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const getQuizResult = () => {
    // Count occurrences of each score category
    const counts = { rocket: 0, machine: 0, hacker: 0, ghost: 0, legend: 0 };
    answers.forEach(score => {
      counts[score] = (counts[score] || 0) + 1;
    });

    const highest = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    const personalities = {
      rocket: {
        name: 'The Startup Rocket 🚀',
        desc: 'High velocity, rapid releases, and a small team. You values speed and shipping features above documentation and strict bureaucracy.'
      },
      machine: {
        name: 'The Corporate Machine 🏢',
        desc: 'Steady pace, strict review rules, and highly structured release cycles. Excellent test coverage and documentation, though velocity is moderate.'
      },
      hacker: {
        name: 'The Solo Hacker 💻',
        desc: 'One developer owns the repository, committing in sporadic, high-energy bursts. Extremely quick development, but the bus factor is critical.'
      },
      ghost: {
        name: 'The Ghost Town 👻',
        desc: 'Low commit frequencies, piling open issues, and inactive branches. The project is mostly frozen, in maintenance mode, or abandoned.'
      },
      legend: {
        name: 'The Open Source Legend 🌟',
        desc: 'Highly collaborative repository with a crowded list of contributors, stars, and extremely active issue discussions. A true community pillar.'
      }
    };

    return personalities[highest] || personalities.hacker;
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  const shareResult = () => {
    const res = getQuizResult();
    const text = `Just ran the Repo Personality Quiz for ${repoInfo?.owner || 'our'}/${repoInfo?.repo || 'codebase'}! Result: "${res.name}". Find out your repo's type! 🚀 #MERN #GitHub`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const result = showResult ? getQuizResult() : null;

  return (
    <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
      {!showResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={22} color="var(--accent)" />
            <h3 style={{ margin: 0 }}>Repository Personality Quiz</h3>
          </div>
          <div className="bar-bg" style={{ height: '6px' }}>
            <div className="bar-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: 'var(--accent)' }} />
          </div>

          <div style={{ marginTop: '10px' }}>
            <span className="text-muted" style={{ fontSize: '12px', fontWeight: '700' }}>QUESTION {currentQuestion + 1} of {questions.length}</span>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
              {questions[currentQuestion].q}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {questions[currentQuestion].options.map((opt, idx) => (
              <button 
                key={idx} 
                className="tab-btn" 
                onClick={() => handleSelectOption(opt.score)}
                style={{ textAlign: 'left', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px' }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>Quiz Result</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {result.name}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', maxWidth: '450px' }}>
            {result.desc}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="copy-btn" onClick={shareResult} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {copied ? <Check size={14} className="copied" /> : <Share2 size={14} />}
              {copied ? 'Result Copied!' : 'Share Result'}
            </button>
            <button className="copy-btn" onClick={handleRestart} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} /> Restart Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
