import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Folder, FolderOpen, File, Search, ZoomIn, ZoomOut, RotateCcw, GitFork, List, Network } from 'lucide-react';

export default function FileTree({ files = [], repoName = 'Project' }) {
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

  // Parse flat file list into hierarchical tree structure
  const rootTree = useMemo(() => {
    if (!files || files.length === 0) return null;

    const root = {
      id: 'root',
      name: repoName || 'root',
      path: '',
      type: 'tree',
      children: [],
      isOpen: true
    };

    files.forEach((f, idx) => {
      const parts = (f.path || '').split('/');
      let current = root;

      parts.forEach((part, partIdx) => {
        const isFile = partIdx === parts.length - 1;
        const currentPath = parts.slice(0, partIdx + 1).join('/');

        if (isFile) {
          current.children.push({
            id: f.sha || `file-${idx}`,
            name: part,
            path: currentPath,
            type: f.type || 'blob',
            size: f.size || 0,
            extension: part.includes('.') ? part.split('.').pop() : 'file',
          });
        } else {
          let folder = current.children.find(c => c.name === part && c.type === 'tree');
          if (!folder) {
            folder = {
              id: `folder-${currentPath}`,
              name: part,
              path: currentPath,
              type: 'tree',
              children: [],
              isOpen: true
            };
            current.children.push(folder);
          }
          current = folder;
        }
      });
    });

    // Sort folders first, then files alphabetically
    const sortTree = (node) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type === 'tree' && b.type !== 'tree') return -1;
          if (a.type !== 'tree' && b.type === 'tree') return 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(root);

    return root;
  }, [files, repoName]);

  // D3 Directory Graph Rendering
  useEffect(() => {
    if (viewMode !== 'graph' || !rootTree || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 520;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .style('background', '#ffffff')
      .style('border', '2px solid #000000')
      .style('box-shadow', '4px 4px 0px #000000');

    const g = svg.append('g');

    // Zoom setup
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Limit depth for visual layout clarity if codebase has thousands of files
    const prepareHierarchy = (node, depth = 0) => {
      // If node is collapsed, hide children
      const isExpanded = expandedFolders.has(node.id);
      return {
        ...node,
        children: (isExpanded && node.children && depth < 5) 
          ? node.children.map(c => prepareHierarchy(c, depth + 1)) 
          : null,
        _allChildrenCount: node.children ? node.children.length : 0
      };
    };

    const displayTreeData = prepareHierarchy(rootTree);
    const hierarchy = d3.hierarchy(displayTreeData);

    // Horizontal tree layout
    const nodeWidth = 190;
    const nodeHeight = 44;
    const treeLayout = d3.tree()
      .nodeSize([nodeHeight, nodeWidth])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3));

    treeLayout(hierarchy);

    // Draw links
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#000000')
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(hierarchy.links())
      .join('path')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Draw node groups
    const node = g.append('g')
      .selectAll('g')
      .data(hierarchy.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.data);
        if (d.data.type === 'tree') {
          setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(d.data.id)) {
              next.delete(d.data.id);
            } else {
              next.add(d.data.id);
            }
            return next;
          });
        }
      });

    // Node Box (Card)
    node.append('rect')
      .attr('x', -8)
      .attr('y', -16)
      .attr('width', d => Math.max(130, d.data.name.length * 8 + 45))
      .attr('height', 32)
      .attr('rx', 3)
      .attr('fill', d => {
        if (searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return '#ffffaa';
        }
        return d.data.type === 'tree' ? '#ffffff' : '#f9f9f9';
      })
      .attr('stroke', '#000000')
      .attr('stroke-width', d => (d.data.type === 'tree' ? 2 : 1.5))
      .style('filter', 'drop-shadow(2px 2px 0px #000000)');

    // Node Icons & Indicators
    node.append('text')
      .attr('x', 2)
      .attr('y', 5)
      .attr('font-size', '13px')
      .text(d => {
        if (d.data.type === 'tree') {
          return expandedFolders.has(d.data.id) ? '📂' : '📁';
        }
        return '📄';
      });

    // Node Label
    node.append('text')
      .attr('x', 24)
      .attr('y', 4)
      .attr('fill', '#000000')
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('font-weight', d => (d.data.type === 'tree' ? '800' : '600'))
      .text(d => {
        const name = d.data.name;
        return name.length > 18 ? name.substring(0, 16) + '..' : name;
      });

    // Child count badge for folders
    node.filter(d => d.data.type === 'tree' && d.data._allChildrenCount > 0)
      .append('text')
      .attr('x', d => Math.max(130, d.data.name.length * 8 + 45) - 14)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#555555')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', '700')
      .text(d => d.data._allChildrenCount);

    // Initial Auto-center
    const initialTransform = d3.zoomIdentity.translate(80, height / 2).scale(0.85);
    svg.call(zoom.transform, initialTransform);

  }, [rootTree, viewMode, expandedFolders, searchTerm]);

  // List View Recursive Component
  const renderListBranch = (node, depth = 0) => {
    if (!node) return null;
    const isFolder = node.type === 'tree';
    const isOpen = expandedFolders.has(node.id);
    const matchesSearch = searchTerm ? node.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 18}px` }} className="list-node-row">
        <div 
          className={`list-item ${isFolder ? 'folder' : 'file'} ${matchesSearch && searchTerm ? 'highlighted' : ''}`}
          onClick={() => {
            setSelectedNode(node);
            if (isFolder) {
              setExpandedFolders(prev => {
                const next = new Set(prev);
                if (next.has(node.id)) next.delete(node.id);
                else next.add(node.id);
                return next;
              });
            }
          }}
        >
          {isFolder ? (
            isOpen ? <FolderOpen size={16} className="icon" /> : <Folder size={16} className="icon" />
          ) : (
            <File size={16} className="icon file-icon" />
          )}
          <span className="node-name">{node.name}</span>
          {isFolder && node.children && (
            <span className="count-pill">{node.children.length} items</span>
          )}
        </div>
        {isFolder && isOpen && node.children && (
          <div className="list-children">
            {node.children.map(child => renderListBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!files || files.length === 0) {
    return (
      <div className="empty-tree-container">
        <p className="no-data">No repository file tree data loaded.</p>
      </div>
    );
  }

  return (
    <div className="directory-graph-module" ref={containerRef}>
      {/* Controls & Filter Bar */}
      <div className="tree-toolbar">
        <div className="search-box">
          <Search size={16} className="icon" />
          <input 
            type="text" 
            placeholder="Filter files / folders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setViewMode('graph')}
              title="Interactive Visual Directory Graph"
            >
              <Network size={14} /> Directory Graph
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Classic Tree Hierarchy List"
            >
              <List size={14} /> Hierarchy List
            </button>
          </div>

          <button 
            className="action-btn"
            onClick={() => {
              if (expandedFolders.size > 1) {
                setExpandedFolders(new Set(['root']));
              } else {
                // Expand all
                const all = new Set(['root']);
                const collect = (n) => {
                  if (n.type === 'tree') {
                    all.add(n.id);
                    if (n.children) n.children.forEach(collect);
                  }
                };
                if (rootTree) collect(rootTree);
                setExpandedFolders(all);
              }
            }}
          >
            {expandedFolders.size > 1 ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Main Graph or List View */}
      {viewMode === 'graph' ? (
        <div className="graph-canvas-wrapper">
          <svg ref={svgRef}></svg>
          <div className="graph-hint">
            <span>🖱️ Drag to pan • Scroll to zoom • Click folder to expand/collapse</span>
          </div>
        </div>
      ) : (
        <div className="tree-list-wrapper">
          {rootTree && renderListBranch(rootTree)}
        </div>
      )}

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="selected-node-footer">
          <div className="footer-title">
            <span className="type-badge">{selectedNode.type === 'tree' ? 'DIRECTORY' : 'FILE'}</span>
            <strong>{selectedNode.path || selectedNode.name}</strong>
          </div>
          {selectedNode.type !== 'tree' && selectedNode.size !== undefined && (
            <span className="size-info">Size: {(selectedNode.size / 1024).toFixed(1)} KB</span>
          )}
          <button className="close-footer" onClick={() => setSelectedNode(null)}>×</button>
        </div>
      )}

      <style>{`
        .directory-graph-module {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .tree-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          flex: 1;
          min-width: 220px;
        }
        .search-box .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #000000;
        }
        .search-box input {
          width: 100%;
          padding: 8px 12px 8px 34px;
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
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .view-toggle {
          display: flex;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          overflow: hidden;
        }
        .toggle-btn {
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
        .toggle-btn.active {
          background: #000000;
          color: #ffffff;
        }
        .action-btn {
          padding: 8px 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          border-radius: 4px;
          color: #000000;
          font-family: monospace;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .action-btn:hover {
          background: #000000;
          color: #ffffff;
        }
        .graph-canvas-wrapper {
          position: relative;
          width: 100%;
        }
        .graph-hint {
          position: absolute;
          bottom: 12px;
          right: 14px;
          background: #ffffff;
          border: 1px solid #000000;
          box-shadow: 2px 2px 0px #000000;
          padding: 4px 10px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #000000;
        }
        .tree-list-wrapper {
          max-height: 480px;
          overflow-y: auto;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px #000000;
          border-radius: 4px;
          padding: 16px;
        }
        .list-node-row {
          margin: 4px 0;
        }
        .list-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          font-size: 13px;
          border: 1px solid transparent;
        }
        .list-item:hover {
          background: #f0f0f0;
          border-color: #000000;
        }
        .list-item.highlighted {
          background: #ffffaa;
          border-color: #000000;
        }
        .list-item.folder .node-name {
          font-weight: 800;
          color: #000000;
        }
        .list-item.file .node-name {
          font-weight: 600;
          color: #222222;
        }
        .list-item .icon {
          color: #000000;
          flex-shrink: 0;
        }
        .count-pill {
          margin-left: auto;
          font-size: 10px;
          font-weight: 800;
          background: #e0e0e0;
          border: 1px solid #000000;
          padding: 1px 6px;
          border-radius: 2px;
        }
        .selected-node-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 3px 3px 0px #000000;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        .type-badge {
          background: #000000;
          color: #ffffff;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 2px;
          margin-right: 8px;
        }
        .close-footer {
          background: none;
          border: none;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
          color: #000000;
        }
        .no-data {
          font-size: 13px;
          font-weight: 700;
          color: #000000;
          text-align: center;
          padding: 24px 0;
        }
      `}</style>
    </div>
  );
}
