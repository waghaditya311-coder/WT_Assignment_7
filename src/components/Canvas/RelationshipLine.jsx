import React, { useCallback } from 'react';
import useDiagramStore from '../../store/diagramStore';
import { getConnectionPoints, getMidpoint, getLabelPoint } from '../../utils/svgArrows';

const REL_CONFIG = {
  association:   { marker: 'url(#arrow-open)',     dash: 'none',     color: '#94a3b8' },
  inheritance:   { marker: 'url(#arrow-inherit)',   dash: 'none',     color: '#7c3aed' },
  implementation:{ marker: 'url(#arrow-implement)', dash: '8,5',      color: '#06b6d4' },
  aggregation:   { markerStart: 'url(#diamond-aggr)', dash: 'none',  color: '#94a3b8' },
  composition:   { markerStart: 'url(#diamond-comp)', dash: 'none',  color: '#7c3aed' },
  dependency:    { marker: 'url(#arrow-open)',      dash: '5,4',      color: '#fb923c' },
};

export default function RelationshipLine({ rel, classes, selected }) {
  const { selectRel } = useDiagramStore();

  const sourceBox = classes.find(c => c.id === rel.sourceId);
  const targetBox = classes.find(c => c.id === rel.targetId);

  if (!sourceBox || !targetBox) return null;

  const { source, target } = getConnectionPoints(sourceBox, targetBox);
  const config = REL_CONFIG[rel.type] || REL_CONFIG.association;

  const mid = getMidpoint(source, target);
  const srcLabel = rel.sourceMultiplicity
    ? getLabelPoint(source, target, 0.08, 14)
    : null;
  const tgtLabel = rel.targetMultiplicity
    ? getLabelPoint(target, source, 0.08, 14)
    : null;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    selectRel(rel.id);
  }, [rel.id, selectRel]);

  return (
    <g>
      {/* Invisible thick hit area */}
      <line
        x1={source.x} y1={source.y} x2={target.x} y2={target.y}
        stroke="transparent" strokeWidth="12"
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      />
      {/* Visible line */}
      <line
        x1={source.x} y1={source.y} x2={target.x} y2={target.y}
        stroke={selected ? '#fbbf24' : config.color}
        strokeWidth={selected ? 2.5 : 1.8}
        strokeDasharray={config.dash || 'none'}
        markerEnd={config.marker}
        markerStart={config.markerStart}
        style={{ cursor: 'pointer', transition: 'stroke 0.15s' }}
        onClick={handleClick}
      />
      {/* Relationship type label */}
      <text
        x={mid.x} y={mid.y - 8}
        textAnchor="middle"
        fontSize="11"
        fill={selected ? '#fbbf24' : '#64748b'}
        fontFamily="Inter, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {rel.label || ''}
      </text>
      {/* Multiplicity labels */}
      {srcLabel && (
        <text x={srcLabel.x} y={srcLabel.y} fontSize="11" fill="#94a3b8" textAnchor="middle"
          fontFamily="Inter, sans-serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {rel.sourceMultiplicity}
        </text>
      )}
      {tgtLabel && (
        <text x={tgtLabel.x} y={tgtLabel.y} fontSize="11" fill="#94a3b8" textAnchor="middle"
          fontFamily="Inter, sans-serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {rel.targetMultiplicity}
        </text>
      )}
    </g>
  );
}
