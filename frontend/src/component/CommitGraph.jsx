/**
 * CommitGraph Component
 * Renders a beautiful visual branch/merge history tree similar to git log DAG graphs.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function CommitGraph({ commits, defaultBranch }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  // Filter commits safely
  const filteredCommits = (commits || []).filter(c => {
    if (!c) return false;
    const authorStr = String(c.author || '');
    const msgStr = String(c.message || '');
    const shaStr = String(c.sha || '');

    const matchAuthor = filterAuthor ? authorStr.toLowerCase().includes(filterAuthor.toLowerCase()) : true;
    const matchSearch = searchTerm ? (
      msgStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
      shaStr.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    return matchAuthor && matchSearch;
  });

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || filteredCommits.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = window.innerWidth < 600 ? 280 : 400;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .style('background', '#ffffff')
      .style('border', '2px solid #000000')
      .style('box-shadow', '4px 4px 0px #000000');

    const g = svg.append('g');

    // Enable zoom/pan behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Position commits in a simple timeline structure
    const nodes = filteredCommits.map((c, i) => ({
      ...c,
      id: c.sha,
      // Lay out horizontally by date order (newest on right or left)
      x: width - 80 - i * 110,
      // Stagger y based on author or index to show branch branches
      y: height / 2 + (i % 2 === 0 ? -40 : 40) + (((c.author ? c.author.length : 3) % 3) * 15),
    }));

    // Find links (parent connections)
    const links = [];
    nodes.forEach(node => {
      if (node.parents) {
        node.parents.forEach(parentSha => {
          const targetNode = nodes.find(n => n.sha === parentSha || (parentSha && parentSha.startsWith(n.sha)) || (n.sha && n.sha.startsWith(parentSha)));
          if (targetNode) {
            links.push({
              source: node,
              target: targetNode
            });
          }
        });
      }
    });

    // Draw link lines (curves)
    g.append('g')
      .attr('stroke', '#000000')
      .attr('stroke-width', 2.5)
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

    // Draw commit node groups
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Node outer rim
    nodeGroup.append('circle')
      .attr('r', 12)
      .attr('fill', '#000000')
      .attr('opacity', 0.1);

    // Node body
    nodeGroup.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.sha === (commits && commits[0]?.sha) ? '#000000' : '#ffffff')
      .attr('stroke', '#000000')
      .attr('stroke-width', 2.5);

    // Short SHA Labels
    nodeGroup.append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000000')
      .style('font-size', '11px')
      .style('font-family', 'monospace')
      .style('font-weight', '700')
      .text(d => d.sha);

    // Short Message Labels (trimmed)
    nodeGroup.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333333')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .text(d => {
        const m = String(d.message || '');
        return m.length > 15 ? m.substring(0, 15) + '...' : m;
      });

    // Default zoom layout centered on first commit
    if (nodes.length > 0) {
      const initialTransform = d3.zoomIdentity.translate(50, 0).scale(0.9);
      svg.call(zoom.transform, initialTransform);
    }
  }, [filteredCommits, commits, containerWidth]);

  return (
    <div className="commit-graph-container" ref={containerRef}>
      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={16} className="icon" />
          <input 
            type="text" 
            placeholder="Search commits (message, sha)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-input-group">
          <Filter size={16} className="icon" />
          <input 
            type="text" 
            placeholder="Filter by author..." 
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
          />
        </div>
        <button className="reset-btn" onClick={() => { setSearchTerm(''); setFilterAuthor(''); setSelectedNode(null); }}>
          <RefreshCw size={14} /> Clear
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <svg ref={svgRef}></svg>

        {selectedNode && (
          <div className="node-detail-panel glass-panel">
            <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
            <h3>Commit Detail</h3>
            <p><strong>SHA:</strong> <span className="sha-txt">{selectedNode.sha}</span></p>
            <p><strong>Author:</strong> {selectedNode.author}</p>
            <p><strong>Date:</strong> {new Date(selectedNode.date).toLocaleString()}</p>
            <p><strong>Message:</strong> {selectedNode.message}</p>
          </div>
        )}
      </div>

      <style>{`
        .commit-graph-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .filter-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-input-group {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .filter-input-group .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }
        .filter-input-group input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          border-radius: 4px;
          border: 2px solid #000000;
          background: #ffffff;
          color: #000000;
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
        }
        .reset-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          color: #000000;
          cursor: pointer;
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
        }
        .reset-btn:hover {
          background: #000000;
          color: #ffffff;
        }
        .node-detail-panel {
          position: absolute;
          bottom: 15px;
          left: 15px;
          right: 15px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          border-radius: 4px;
          padding: 14px;
          z-index: 10;
          color: #000000;
        }
        .node-detail-panel h3 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 800;
          color: #000000;
          text-transform: uppercase;
        }
        .node-detail-panel p {
          margin: 4px 0;
          font-size: 12px;
          color: #111111;
        }
        .sha-txt {
          font-family: monospace;
          background: #000000;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 2px;
          font-weight: 700;
        }
        .close-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          color: #000000;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .filter-bar {
            flex-direction: column;
          }
          .filter-input-group {
            width: 100%;
            min-width: 0;
          }
          .reset-btn {
            width: 100%;
            justify-content: center;
          }
          .node-detail-panel {
            left: 8px;
            right: 8px;
            bottom: 8px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}
