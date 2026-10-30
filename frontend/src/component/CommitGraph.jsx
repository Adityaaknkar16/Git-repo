/**
 * CommitGraph Component
 * Renders a full authentic Git Directed Graph (DAG) with:
 * - Real branch swimlane layout & topology
 * - Force-directed network graph mode
 * - Directed edge arrows (marker-end)
 * - Auto-fit bounding box zoom
 * - Interactive node inspector
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Search, Filter, RefreshCw, ZoomIn, ZoomOut, Maximize2, GitBranch, GitMerge, Network, GitCommit, ExternalLink } from 'lucide-react';

export default function CommitGraph({ commits = [], defaultBranch = 'main', repoUrl = '' }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const svgSelectionRef = useRef(null);

  const [graphMode, setGraphMode] = useState('dag'); // 'dag' or 'force'
  const [filterAuthor, setFilterAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Resize observer
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

  // Filter commits safely
  const filteredCommits = useMemo(() => {
    return (commits || []).filter(c => {
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
  }, [commits, filterAuthor, searchTerm]);

  // Compute Topology: assign branch lanes and identify parents
  const { nodesData, linksData } = useMemo(() => {
    if (!filteredCommits || filteredCommits.length === 0) {
      return { nodesData: [], linksData: [] };
    }

    // Sort chronologically (oldest first for lane tracing)
    const sorted = [...filteredCommits].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Map of sha to commit
    const commitMap = new Map();
    sorted.forEach(c => commitMap.set(c.sha, c));

    // Track active branch lanes
    const activeLanes = new Map(); // laneIndex -> branchHeadSha
    const commitLane = new Map(); // sha -> laneIndex

    // Primary branch is lane 0
    let nextAvailableLane = 1;

    sorted.forEach((c, idx) => {
      const parents = (c.parents || []).filter(p => p && commitMap.has(p));
      const isMerge = parents.length > 1;

      if (parents.length === 0) {
        // Root commit: starts lane 0 or new lane
        if (!commitLane.has(c.sha)) {
          commitLane.set(c.sha, 0);
          activeLanes.set(0, c.sha);
        }
      } else {
        // Inherit lane from primary parent (parents[0])
        const primaryParentSha = parents[0];
        const parentLane = commitLane.get(primaryParentSha) ?? 0;

        // Check if primary parent was already extended by another commit (branch fork)
        const isFork = Array.from(commitLane.entries()).some(
          ([otherSha, oLane]) => otherSha !== c.sha && commitMap.get(otherSha)?.parents?.includes(primaryParentSha) && oLane === parentLane
        );

        if (isFork) {
          const newLane = (nextAvailableLane % 2 === 1) 
            ? Math.ceil(nextAvailableLane / 2) 
            : -Math.ceil(nextAvailableLane / 2);
          nextAvailableLane++;
          commitLane.set(c.sha, newLane);
          activeLanes.set(newLane, c.sha);
        } else {
          commitLane.set(c.sha, parentLane);
          activeLanes.set(parentLane, c.sha);
        }
      }
    });

    // Generate Node representations
    const totalCount = sorted.length;
    const nodes = sorted.map((c, i) => {
      const lane = commitLane.get(c.sha) || 0;
      const parents = (c.parents || []).filter(p => p && commitMap.has(p));
      const isMerge = (c.parents || []).length > 1;
      const isHead = i === totalCount - 1;

      return {
        ...c,
        id: c.sha,
        lane,
        isMerge,
        isHead,
        orderIndex: i,
      };
    });

    // Generate Links (Directed edges pointing from parent to child)
    const links = [];
    nodes.forEach(node => {
      if (node.parents) {
        node.parents.forEach(parentSha => {
          const sourceNode = nodes.find(n => n.sha === parentSha || (parentSha && parentSha.startsWith(n.sha)) || (n.sha && n.sha.startsWith(parentSha)));
          if (sourceNode) {
            links.push({
              source: sourceNode,
              target: node,
              isMergeLink: node.isMerge && sourceNode.sha !== node.parents[0],
            });
          }
        });
      }
    });

    return { nodesData: nodes, linksData: links };
  }, [filteredCommits]);

  // Main Render Effect
  useEffect(() => {
    if (!svgRef.current || nodesData.length === 0) return;

    const width = containerWidth || 800;
    const height = 460;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .style('background', '#ffffff')
      .style('border', '2px solid #000000')
      .style('box-shadow', '4px 4px 0px #000000');

    svgSelectionRef.current = svg;

    // Define Arrow Marker for Directed Graph
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'dag-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 9 5 L 0 8.5 z')
      .attr('fill', '#000000');

    defs.append('marker')
      .attr('id', 'dag-arrow-merge')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 9 5 L 0 8.5 z')
      .attr('fill', '#555555');

    const g = svg.append('g');

    // Zoom setup
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    if (graphMode === 'dag') {
      // --- MODE 1: REAL GIT BRANCH DAG ---
      const laneHeight = 65;
      const stepX = 140;
      const centerY = height / 2;
      const startX = 80;

      // Position nodes horizontally by chronological order and vertically by lane
      nodesData.forEach(d => {
        d.x = startX + d.orderIndex * stepX;
        d.y = centerY + d.lane * laneHeight;
      });

      // Background Branch Lane Guides
      const uniqueLanes = Array.from(new Set(nodesData.map(d => d.lane))).sort((a, b) => a - b);
      const guidesGroup = g.append('g').attr('class', 'lane-guides');
      
      uniqueLanes.forEach(lane => {
        const laneY = centerY + lane * laneHeight;
        guidesGroup.append('line')
          .attr('x1', 0)
          .attr('x2', startX + nodesData.length * stepX + 100)
          .attr('y1', laneY)
          .attr('y2', laneY)
          .attr('stroke', '#e5e5e5')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,4');

        // Lane Tag
        guidesGroup.append('text')
          .attr('x', 15)
          .attr('y', laneY - 8)
          .attr('fill', '#777777')
          .style('font-family', 'monospace')
          .style('font-size', '10px')
          .style('font-weight', '700')
          .text(lane === 0 ? `[${defaultBranch || 'main'}]` : `[branch-lane-${Math.abs(lane)}]`);
      });

      // Draw Directed Links with Smooth Bezier Curves
      const linksGroup = g.append('g').attr('class', 'links');
      linksGroup.selectAll('path')
        .data(linksData)
        .join('path')
        .attr('d', d => {
          const sx = d.source.x;
          const sy = d.source.y;
          const tx = d.target.x;
          const ty = d.target.y;

          if (sy === ty) {
            // Straight line on same branch lane
            return `M ${sx} ${sy} L ${tx} ${ty}`;
          } else {
            // Cubic Bezier curve transitioning between branch lanes
            const midX = (sx + tx) / 2;
            return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
          }
        })
        .attr('fill', 'none')
        .attr('stroke', d => d.isMergeLink ? '#555555' : '#000000')
        .attr('stroke-width', d => d.isMergeLink ? 2 : 2.5)
        .attr('stroke-dasharray', d => d.isMergeLink ? '4,3' : 'none')
        .attr('marker-end', d => d.isMergeLink ? 'url(#dag-arrow-merge)' : 'url(#dag-arrow)');

      // Draw Commit Nodes
      drawCommitNodes(g, nodesData);

      // Auto-fit to view
      fitToScreen(nodesData, width, height, zoom, svg);

    } else {
      // --- MODE 2: FORCE-DIRECTED TOPOLOGY GRAPH ---
      // Physics-based network where topology forms naturally
      const simulation = d3.forceSimulation(nodesData)
        .force('link', d3.forceLink(linksData).id(d => d.id).distance(90))
        .force('charge', d3.forceManyBody().strength(-280))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(35));

      const linkElements = g.append('g')
        .selectAll('line')
        .data(linksData)
        .join('line')
        .attr('stroke', '#000000')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#dag-arrow)');

      const nodeElements = drawCommitNodes(g, nodesData, true, simulation);

      simulation.on('tick', () => {
        linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
      });

      // Fit to view after simulation settles
      setTimeout(() => {
        fitToScreen(nodesData, width, height, zoom, svg);
      }, 350);
    }

  }, [nodesData, linksData, graphMode, containerWidth]);

  // Helper: Draw Commit Nodes
  const drawCommitNodes = (g, nodes, enableDrag = false, simulation = null) => {
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Drag behavior for force mode
    if (enableDrag && simulation) {
      const drag = d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
      nodeGroup.call(drag);
    }

    // Outer Selection Halo
    nodeGroup.append('circle')
      .attr('r', 16)
      .attr('fill', '#000000')
      .attr('opacity', 0.08);

    // Node Body (Square for merge, circle for regular)
    nodeGroup.each(function(d) {
      const el = d3.select(this);
      const isHead = d.isHead;
      const isMerge = d.isMerge;

      if (isMerge) {
        // Diamond / Square for Merge Commits
        el.append('rect')
          .attr('x', -9)
          .attr('y', -9)
          .attr('width', 18)
          .attr('height', 18)
          .attr('transform', 'rotate(45)')
          .attr('fill', isHead ? '#000000' : '#ffffff')
          .attr('stroke', '#000000')
          .attr('stroke-width', 2.5);
      } else {
        // Circle for Regular Commits
        el.append('circle')
          .attr('r', 9)
          .attr('fill', isHead ? '#000000' : '#ffffff')
          .attr('stroke', '#000000')
          .attr('stroke-width', 2.5);
      }
    });

    // SHA Badge Tag (Above node)
    nodeGroup.append('rect')
      .attr('x', -26)
      .attr('y', -30)
      .attr('width', 52)
      .attr('height', 16)
      .attr('rx', 2)
      .attr('fill', '#ffffff')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1.5)
      .style('filter', 'drop-shadow(1px 1px 0px #000000)');

    nodeGroup.append('text')
      .attr('dy', -18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000000')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', '800')
      .text(d => d.sha);

    // Commit Message (Trimmed, below node)
    nodeGroup.append('text')
      .attr('dy', 26)
      .attr('text-anchor', 'middle')
      .attr('fill', '#111111')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('font-weight', '700')
      .text(d => {
        const msg = String(d.message || '');
        return msg.length > 16 ? msg.substring(0, 14) + '..' : msg;
      });

    // Author Tag
    nodeGroup.append('text')
      .attr('dy', 38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666666')
      .style('font-family', 'monospace')
      .style('font-size', '9px')
      .style('font-weight', '600')
      .text(d => `@${d.author || 'dev'}`);

    return nodeGroup;
  };

  // Helper: Fit Graph to Screen
  const fitToScreen = (nodes, width, height, zoom, svg) => {
    if (!nodes || nodes.length === 0) return;

    let minX = d3.min(nodes, d => d.x);
    let maxX = d3.max(nodes, d => d.x);
    let minY = d3.min(nodes, d => d.y);
    let maxY = d3.max(nodes, d => d.y);

    const graphWidth = Math.max(100, maxX - minX + 160);
    const graphHeight = Math.max(100, maxY - minY + 140);

    const scale = Math.min(1.2, Math.max(0.25, 0.85 / Math.max(graphWidth / width, graphHeight / height)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const transform = d3.zoomIdentity
      .translate(width / 2 - scale * centerX, height / 2 - scale * centerY)
      .scale(scale);

    svg.transition().duration(400).call(zoom.transform, transform);
  };

  const handleZoom = (direction) => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current) return;
    svgSelectionRef.current.transition().duration(250).call(
      zoomBehaviorRef.current.scaleBy,
      direction === 'in' ? 1.3 : 0.75
    );
  };

  const handleResetZoom = () => {
    if (!svgSelectionRef.current || !zoomBehaviorRef.current) return;
    fitToScreen(nodesData, containerWidth, 460, zoomBehaviorRef.current, svgSelectionRef.current);
  };

  if (!commits || commits.length === 0) {
    return (
      <div className="empty-graph-panel">
        <p className="no-data">No commit history available to graph.</p>
      </div>
    );
  }

  return (
    <div className="commit-graph-container" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="graph-toolbar">
        <div className="filter-group">
          <div className="input-wrap">
            <Search size={14} className="icon" />
            <input 
              type="text" 
              placeholder="Search commit SHA / message..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-wrap">
            <Filter size={14} className="icon" />
            <input 
              type="text" 
              placeholder="Filter by author..." 
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
            />
          </div>
        </div>

        <div className="mode-and-controls">
          {/* Mode Switcher */}
          <div className="graph-mode-toggle">
            <button 
              className={`mode-btn ${graphMode === 'dag' ? 'active' : ''}`}
              onClick={() => setGraphMode('dag')}
              title="Git Branch Directed Graph (Swimlanes & Directed Arrows)"
            >
              <GitBranch size={14} /> Git DAG
            </button>
            <button 
              className={`mode-btn ${graphMode === 'force' ? 'active' : ''}`}
              onClick={() => setGraphMode('force')}
              title="Force-Directed Topology Network Graph"
            >
              <Network size={14} /> Force Network
            </button>
          </div>

          {/* Zoom Actions */}
          <div className="zoom-actions">
            <button className="icon-btn" onClick={() => handleZoom('in')} title="Zoom In"><ZoomIn size={14} /></button>
            <button className="icon-btn" onClick={() => handleZoom('out')} title="Zoom Out"><ZoomOut size={14} /></button>
            <button className="icon-btn" onClick={handleResetZoom} title="Fit to Screen"><Maximize2 size={14} /></button>
            <button className="icon-btn" onClick={() => { setSearchTerm(''); setFilterAuthor(''); setSelectedNode(null); }} title="Clear Filters"><RefreshCw size={14} /></button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="canvas-wrapper">
        <svg ref={svgRef}></svg>

        {/* Legend Overlay */}
        <div className="canvas-legend">
          <div className="legend-item"><span className="legend-circle regular"></span> Commit</div>
          <div className="legend-item"><span className="legend-square merge"></span> Merge Commit</div>
          <div className="legend-item"><span className="legend-circle head"></span> HEAD Commit</div>
          <div className="legend-item"><span className="legend-arrow">→</span> Directed Flow</div>
        </div>

        {/* Selected Commit Detail Inspector */}
        {selectedNode && (
          <div className="commit-inspect-modal">
            <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
            <div className="modal-header">
              <span className="commit-type-pill">
                {selectedNode.isMerge ? <><GitMerge size={12} /> MERGE COMMIT</> : <><GitCommit size={12} /> COMMIT</>}
              </span>
              <span className="sha-pill">{selectedNode.sha}</span>
            </div>
            <h4 className="commit-msg">{selectedNode.message}</h4>
            
            <div className="meta-grid">
              <div><strong>Author:</strong> {selectedNode.author}</div>
              <div><strong>Date:</strong> {new Date(selectedNode.date).toLocaleString()}</div>
              <div><strong>Branch Track:</strong> {selectedNode.lane === 0 ? defaultBranch : `Lane ${selectedNode.lane}`}</div>
              {selectedNode.parents && selectedNode.parents.length > 0 && (
                <div>
                  <strong>Parents:</strong>{' '}
                  {selectedNode.parents.map(p => (
                    <span 
                      key={p} 
                      className="parent-link"
                      onClick={() => {
                        const target = nodesData.find(n => n.sha === p || (n.sha && n.sha.startsWith(p)));
                        if (target) setSelectedNode(target);
                      }}
                    >
                      {p.substring(0, 7)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {repoUrl && (
              <a 
                href={`${repoUrl.replace(/\/+$/, '')}/commit/${selectedNode.fullSha || selectedNode.sha}`} 
                target="_blank" 
                rel="noreferrer"
                className="view-github-link"
              >
                View on GitHub <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      <style>{`
        .commit-graph-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .graph-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 280px;
        }
        .input-wrap {
          position: relative;
          flex: 1;
        }
        .input-wrap .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #000000;
        }
        .input-wrap input {
          width: 100%;
          padding: 8px 10px 8px 32px;
          border-radius: 4px;
          border: 2px solid #000000;
          background: #ffffff;
          color: #000000;
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 2px 2px 0px #000000;
          outline: none;
        }
        .mode-and-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .graph-mode-toggle {
          display: flex;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          overflow: hidden;
        }
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ffffff;
          border: none;
          color: #000000;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          font-weight: 800;
        }
        .mode-btn.active {
          background: #000000;
          color: #ffffff;
        }
        .zoom-actions {
          display: flex;
          gap: 6px;
        }
        .icon-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          color: #000000;
          cursor: pointer;
        }
        .icon-btn:hover {
          background: #000000;
          color: #ffffff;
        }
        .canvas-wrapper {
          position: relative;
          width: 100%;
        }
        .canvas-legend {
          position: absolute;
          top: 12px;
          left: 14px;
          display: flex;
          gap: 12px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          padding: 6px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #000000;
          flex-wrap: wrap;
          pointer-events: none;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-circle {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #000000;
        }
        .legend-circle.regular { background: #ffffff; }
        .legend-circle.head { background: #000000; }
        .legend-square.merge {
          width: 10px;
          height: 10px;
          border: 2px solid #000000;
          background: #ffffff;
          transform: rotate(45deg);
        }
        .legend-arrow {
          font-weight: 900;
          font-size: 14px;
        }
        .commit-inspect-modal {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          max-width: 650px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          border-radius: 4px;
          padding: 16px;
          z-index: 10;
        }
        .commit-inspect-modal .close-btn {
          position: absolute;
          top: 10px;
          right: 12px;
          background: none;
          border: none;
          font-size: 20px;
          font-weight: 900;
          cursor: pointer;
          color: #000000;
        }
        .modal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .commit-type-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #000000;
          color: #ffffff;
          font-family: monospace;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 2px;
        }
        .sha-pill {
          font-family: monospace;
          font-weight: 800;
          background: #f0f0f0;
          border: 1px solid #000000;
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 11px;
        }
        .commit-msg {
          margin: 0 0 10px;
          font-family: monospace;
          font-size: 14px;
          font-weight: 800;
          color: #000000;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 6px;
          font-family: monospace;
          font-size: 12px;
          color: #222222;
          margin-bottom: 10px;
        }
        .parent-link {
          display: inline-block;
          margin-left: 4px;
          padding: 1px 6px;
          background: #f0f0f0;
          border: 1px solid #000000;
          border-radius: 2px;
          cursor: pointer;
          font-weight: 700;
        }
        .parent-link:hover {
          background: #000000;
          color: #ffffff;
        }
        .view-github-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: monospace;
          font-size: 12px;
          font-weight: 800;
          color: #000000;
          text-decoration: underline;
        }
        .no-data {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          text-align: center;
          padding: 24px 0;
        }
        @media (max-width: 650px) {
          .graph-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .mode-and-controls {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
