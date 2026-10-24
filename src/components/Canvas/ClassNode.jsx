import React, { useRef, useState, useCallback } from 'react';
import useDiagramStore from '../../store/diagramStore';

const VISIBILITY_LABELS = { '+': '+', '-': '−', '#': '#', '~': '~' };
const VISIBILITY_COLORS = { '+': '#4ade80', '-': '#f87171', '#': '#fb923c', '~': '#a78bfa' };

const HEADER_HEIGHT = 48;
const FIELD_HEIGHT = 22;
const METHOD_HEIGHT = 22;
const SECTION_PAD = 10;
const MIN_HEIGHT = 80;

function calcHeight(cls) {
  const fieldsH = cls.fields.length * FIELD_HEIGHT + SECTION_PAD * 2;
  const methodsH = cls.methods.length * METHOD_HEIGHT + SECTION_PAD * 2;
  return HEADER_HEIGHT + fieldsH + 1 + methodsH;
}

export default function ClassNode({ cls, selected, isDrawing, isDrawingSource }) {
  const { select, moveClass, addRelationship, drawingRel } = useDiagramStore();
  const nodeRef = useRef(null);
  const dragStart = useRef(null);
  const [dragging, setDragging] = useState(false);

  const height = Math.max(MIN_HEIGHT, calcHeight(cls));

  // Expose height for relationship calculations
  cls.height = height;

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (isDrawing) {
      // In drawing mode — clicking this node connects the relationship
      if (!isDrawingSource) {
        addRelationship(cls.id);
      }
      return;
    }

    select(cls.id);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: cls.x,
      nodeY: cls.y,
    };
    setDragging(true);

    const onMove = (me) => {
      if (!dragStart.current) return;
      const dx = me.clientX - dragStart.current.mouseX;
      const dy = me.clientY - dragStart.current.mouseY;
      // We need to account for zoom from the store
      const zoom = useDiagramStore.getState().zoom;
      moveClass(cls.id, dragStart.current.nodeX + dx / zoom, dragStart.current.nodeY + dy / zoom);
    };

    const onUp = () => {
      dragStart.current = null;
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [cls.id, cls.x, cls.y, select, moveClass, isDrawing, isDrawingSource, addRelationship]);

  const stereotype = cls.stereotype ? (
    <div className="class-stereotype">{cls.stereotype}</div>
  ) : null;

  return (
    <div
      ref={nodeRef}
      className={`class-node ${selected ? 'selected' : ''} ${isDrawing && !isDrawingSource ? 'connectable' : ''} ${isDrawingSource ? 'drawing-source' : ''} ${dragging ? 'dragging' : ''}`}
      style={{
        left: cls.x,
        top: cls.y,
        width: cls.width,
        minHeight: height,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="class-header">
        {stereotype}
        <div className="class-name">{cls.name}</div>
      </div>

      {/* Fields compartment */}
      <div className="class-compartment">
        {cls.fields.length === 0 ? (
          <div className="class-empty-row">— no fields —</div>
        ) : cls.fields.map(f => (
          <div key={f.id} className="class-member">
            <span className="member-vis" style={{ color: VISIBILITY_COLORS[f.visibility] }}>
              {VISIBILITY_LABELS[f.visibility]}
            </span>
            <span className="member-name">{f.name}</span>
            <span className="member-colon">:</span>
            <span className="member-type">{f.type}</span>
            {f.isStatic && <span className="member-badge">static</span>}
          </div>
        ))}
      </div>

      {/* Methods compartment */}
      <div className="class-compartment methods-compartment">
        {cls.methods.length === 0 ? (
          <div className="class-empty-row">— no methods —</div>
        ) : cls.methods.map(m => (
          <div key={m.id} className={`class-member ${m.isAbstract ? 'abstract-member' : ''}`}>
            <span className="member-vis" style={{ color: VISIBILITY_COLORS[m.visibility] }}>
              {VISIBILITY_LABELS[m.visibility]}
            </span>
            <span className="member-name">{m.name}</span>
            <span className="member-paren">(</span>
            <span className="member-params">{m.params}</span>
            <span className="member-paren">)</span>
            <span className="member-colon">:</span>
            <span className="member-type">{m.returnType}</span>
            {m.isStatic && <span className="member-badge">static</span>}
            {m.isAbstract && <span className="member-badge abstract">abstract</span>}
          </div>
        ))}
      </div>

      {/* Connection indicator ring */}
      {isDrawing && !isDrawingSource && (
        <div className="connect-ring" />
      )}
    </div>
  );
}
