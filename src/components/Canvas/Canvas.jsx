import React, { useRef, useState, useCallback, useEffect } from 'react';
import useDiagramStore from '../../store/diagramStore';
import ClassNode from './ClassNode';
import RelationshipLine from './RelationshipLine';

export default function Canvas({ activeRelType }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const {
    classes, relationships, selectedId, selectedRelId,
    zoom, panX, panY, setZoom, setPan,
    clearSelection, drawingRel, cancelDrawingRel, addRelationship,
  } = useDiagramStore();

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pan with middle mouse or space+drag
  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
    } else if (e.target === svgRef.current || e.target === containerRef.current) {
      clearSelection();
      if (drawingRel) cancelDrawingRel();
    }
  }, [panX, panY, clearSelection, drawingRel, cancelDrawingRel]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning && panStart.current) {
      setPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y);
    }
    // Track mouse for drawing relationship preview line
    if (drawingRel) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - panX) / zoom,
          y: (e.clientY - rect.top - panY) / zoom,
        });
      }
    }
  }, [isPanning, panX, panY, setPan, drawingRel, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', handleWheel); };
  }, [handleWheel]);

  // Drawing relationship preview line source
  const sourceClass = drawingRel ? classes.find(c => c.id === drawingRel.sourceId) : null;
  const previewStart = sourceClass
    ? { x: sourceClass.x + sourceClass.width / 2, y: sourceClass.y + (sourceClass.height || 120) / 2 }
    : null;

  return (
    <div
      ref={containerRef}
      className={`canvas-container ${drawingRel ? 'drawing-mode' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Dot grid background */}
      <div className="canvas-grid" style={{
        backgroundPosition: `${panX % (20 * zoom)}px ${panY % (20 * zoom)}px`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
      }} />

      {/* SVG layer for relationships */}
      <svg
        ref={svgRef}
        className="canvas-svg"
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        <defs>
          {/* Arrowhead markers */}
          <marker id="arrow-open" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
          <marker id="arrow-inherit" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto">
            <polygon points="0 0, 12 5, 0 10" fill="#0f1117" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
          <marker id="arrow-implement" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto">
            <polygon points="0 0, 12 5, 0 10" fill="#0f1117" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
          <marker id="diamond-aggr" markerWidth="14" markerHeight="8" refX="1" refY="4" orient="auto">
            <polygon points="0 4, 6 0, 12 4, 6 8" fill="#0f1117" stroke="#94a3b8" strokeWidth="1.5" />
          </marker>
          <marker id="diamond-comp" markerWidth="14" markerHeight="8" refX="1" refY="4" orient="auto">
            <polygon points="0 4, 6 0, 12 4, 6 8" fill="#7c3aed" stroke="#7c3aed" strokeWidth="1" />
          </marker>
        </defs>

        {relationships.map(rel => (
          <RelationshipLine key={rel.id} rel={rel} classes={classes} selected={rel.id === selectedRelId} />
        ))}

        {/* Drawing preview line */}
        {drawingRel && previewStart && (
          <line
            x1={previewStart.x} y1={previewStart.y}
            x2={mousePos.x} y2={mousePos.y}
            stroke="#7c3aed" strokeWidth="2" strokeDasharray="6,4"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {/* DOM layer for class nodes */}
      <div
        className="canvas-nodes"
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        {classes.map(cls => (
          <ClassNode
            key={cls.id}
            cls={cls}
            selected={cls.id === selectedId}
            isDrawing={!!drawingRel}
            isDrawingSource={drawingRel?.sourceId === cls.id}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">{Math.round(zoom * 100)}%</div>

      {drawingRel && (
        <div className="drawing-hint">
          Click on a target class to connect • <span>ESC to cancel</span>
        </div>
      )}
    </div>
  );
}
