import React, { useState } from 'react';
import { Sparkles, Copy, Check, FileDown, BookOpen } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function OnboardingGuide({ repoUrl, dependencies, fileTree, issues }) {
  const [loading, setLoading] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateGuide = async () => {
    setLoading(true);
    setGuideText('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/onboarding-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, dependencies, fileTree, issues }),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          finished = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              finished = true;
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setGuideText((prev) => prev + parsed.text);
              }
            } catch (e) {
              // Parse fallback
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setGuideText('Error: Failed to generate onboarding guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Custom simple Markdown Parser
  const parseMarkdownToHtml = (markdown) => {
    if (!markdown) return '';
    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');

    // Code Blocks
    html = html.replace(/```bash\n([\s\S]*?)\n```/g, '<pre><code class="language-bash">$1</code></pre>');
    html = html.replace(/```javascript\n([\s\S]*?)\n```/g, '<pre><code class="language-javascript">$1</code></pre>');
    html = html.replace(/```json\n([\s\S]*?)\n```/g, '<pre><code class="language-json">$1</code></pre>');
    html = html.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Lists (convert to ul/li)
    html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');

    return html;
  };

  const copyGuide = () => {
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AI Onboarding Guide</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 40px; color: #222; }
            h1 { font-size: 26px; border-bottom: 2px solid #5856d6; padding-bottom: 8px; color: #5856d6; margin-top: 0; }
            h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
            code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 13px; color: #c644fc; }
            pre { background: #f8f8f8; padding: 15px; border-radius: 6px; overflow-x: auto; border: 1px solid #ddd; }
            pre code { background: transparent; padding: 0; color: #333; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; }
          </style>
        </head>
        <body>
          ${parseMarkdownToHtml(guideText)}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Read time estimate: word count / 200 (average WPM)
  const getReadTime = () => {
    if (!guideText) return 0;
    const words = guideText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div className="onboarding-guide-container">
      <div className="card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>AI-Generated Onboarding Guide</h2>
            <p className="text-muted" style={{ marginTop: '4px' }}>
              Compile a complete setup instructions and walkthrough guide specifically tailored to this codebase.
            </p>
          </div>
          {!guideText && !loading && (
            <button className="demo-btn-large" onClick={generateGuide}>
              <Sparkles size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Generate Guide
            </button>
          )}
        </div>

        {loading && !guideText && (
          <div className="health-loading">
            <div className="spinner"></div>
            <p>Initializing AI guide model and reviewing repository files...</p>
          </div>
        )}

        {guideText && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="guide-toolbar">
              <div className="toolbar-left">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={15} />
                  Estimated reading time: <strong className="read-time">{getReadTime()} min</strong>
                </span>
              </div>
              <div className="toolbar-actions">
                <button onClick={copyGuide} className="copy-btn">
                  {copied ? <Check size={14} className="copied" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={downloadPdf} className="copy-btn" disabled={loading}>
                  <FileDown size={14} /> Download PDF
                </button>
              </div>
            </div>

            <div 
              className="guide-content-box" 
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(guideText) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
