import React, { useState } from 'react';
import useDiagramStore from '../../store/diagramStore';
import {
  Plus, Trash2, Square, GitMerge, ArrowRight, Triangle,
  Layers, ZoomIn, ZoomOut, RefreshCw, Download, BookOpen,
} from 'lucide-react';

const REL_TYPES = [
  { id: 'association',    label: 'Association',    icon: '→',  title: 'Association (→)' },
  { id: 'inheritance',   label: 'Inheritance',    icon: '▷',  title: 'Inheritance (hollow triangle)' },
  { id: 'implementation',label: 'Realization',    icon: '⇢',  title: 'Realization / Implements (dashed)' },
  { id: 'aggregation',   label: 'Aggregation',    icon: '◇→', title: 'Aggregation (hollow diamond)' },
  { id: 'composition',   label: 'Composition',    icon: '◆→', title: 'Composition (filled diamond)' },
  { id: 'dependency',    label: 'Dependency',     icon: '⤳',  title: 'Dependency (dashed arrow)' },
];

export default function Toolbar({ activeRelType, setActiveRelType, onShowCode, showCode }) {
  const { addClass, clearCanvas, setZoom, zoom, classes } = useDiagramStore();

  const handleClear = () => {
    if (classes.length === 0 || window.confirm('Clear entire diagram?')) {
      clearCanvas();
    }
  };

  const handleExport = () => {
    // Trigger PNG export via canvas
    window.dispatchEvent(new CustomEvent('export-png'));
  };

  return (
    <div className="toolbar">
      {/* Left: Main actions */}
      <div className="toolbar-group">
        <div className="toolbar-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">UML Studio</span>
        </div>

        <div className="toolbar-divider" />

        <button
          id="btn-add-class"
          className="toolbar-btn primary"
          onClick={addClass}
          title="Add new class"
        >
          <Plus size={16} />
          <span>Add Class</span>
        </button>

        <button
          id="btn-clear"
          className="toolbar-btn danger"
          onClick={handleClear}
          title="Clear canvas"
        >
          <Trash2 size={15} />
          <span>Clear</span>
        </button>
      </div>

      {/* Center: Relationship types */}
      <div className="toolbar-group center-group">
        <span className="toolbar-label">Relationships:</span>
        {REL_TYPES.map(r => (
          <button
            key={r.id}
            id={`btn-rel-${r.id}`}
            className={`toolbar-btn rel-btn ${activeRelType === r.id ? 'rel-active' : ''}`}
            onClick={() => setActiveRelType(activeRelType === r.id ? null : r.id)}
            title={r.title}
          >
            <span className="rel-icon">{r.icon}</span>
            <span className="rel-label">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Zoom + export */}
      <div className="toolbar-group right-group">
        <button className="toolbar-btn icon-btn" onClick={() => setZoom(zoom - 0.1)} title="Zoom out">
          <ZoomOut size={16} />
        </button>
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="toolbar-btn icon-btn" onClick={() => setZoom(zoom + 0.1)} title="Zoom in">
          <ZoomIn size={16} />
        </button>
        <button className="toolbar-btn icon-btn" onClick={() => setZoom(1)} title="Reset zoom">
          <RefreshCw size={15} />
        </button>

        <div className="toolbar-divider" />

        <button
          id="btn-toggle-code"
          className={`toolbar-btn ${showCode ? 'primary' : ''}`}
          onClick={onShowCode}
          title="Toggle Java code panel"
        >
          <BookOpen size={15} />
          <span>Java Code</span>
        </button>

        <button
          id="btn-export"
          className="toolbar-btn"
          onClick={handleExport}
          title="Export as PNG"
        >
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
