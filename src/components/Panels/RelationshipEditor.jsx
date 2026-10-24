import React from 'react';
import useDiagramStore from '../../store/diagramStore';
import { Trash2 } from 'lucide-react';

const REL_TYPE_LABELS = {
  association: 'Association →',
  inheritance: 'Inheritance ▷',
  implementation: 'Realization ⇢',
  aggregation: 'Aggregation ◇→',
  composition: 'Composition ◆→',
  dependency: 'Dependency ⤳',
};

const REL_TYPES = Object.keys(REL_TYPE_LABELS);

export default function RelationshipEditor() {
  const { relationships, selectedRelId, classes, updateRelationship, deleteRelationship } = useDiagramStore();

  const rel = relationships.find(r => r.id === selectedRelId);
  if (!rel) return null;

  const sourceClass = classes.find(c => c.id === rel.sourceId);
  const targetClass = classes.find(c => c.id === rel.targetId);

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <span className="editor-title">Relationship Editor</span>
        <button
          id="btn-delete-rel"
          className="icon-action danger"
          onClick={() => deleteRelationship(rel.id)}
          title="Delete relationship"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="rel-preview">
        <span className="rel-class-name">{sourceClass?.name || '?'}</span>
        <span className="rel-arrow">{REL_TYPE_LABELS[rel.type]?.split(' ')[1] || '→'}</span>
        <span className="rel-class-name">{targetClass?.name || '?'}</span>
      </div>

      <div className="editor-section">
        <label className="editor-label">Relationship Type</label>
        <select
          id="select-rel-type"
          className="editor-select"
          value={rel.type}
          onChange={e => updateRelationship(rel.id, { type: e.target.value })}
        >
          {REL_TYPES.map(t => (
            <option key={t} value={t}>{REL_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="editor-section two-col">
        <div>
          <label className="editor-label">Source Multiplicity</label>
          <input
            id="input-src-mult"
            className="editor-input small"
            value={rel.sourceMultiplicity}
            onChange={e => updateRelationship(rel.id, { sourceMultiplicity: e.target.value })}
            placeholder="1"
            list="mult-options"
          />
        </div>
        <div>
          <label className="editor-label">Target Multiplicity</label>
          <input
            id="input-tgt-mult"
            className="editor-input small"
            value={rel.targetMultiplicity}
            onChange={e => updateRelationship(rel.id, { targetMultiplicity: e.target.value })}
            placeholder="0..*"
            list="mult-options"
          />
        </div>
      </div>

      <div className="editor-section">
        <label className="editor-label">Label (optional)</label>
        <input
          id="input-rel-label"
          className="editor-input"
          value={rel.label}
          onChange={e => updateRelationship(rel.id, { label: e.target.value })}
          placeholder="e.g. owns, uses"
        />
      </div>

      <datalist id="mult-options">
        {['1', '0..1', '0..*', '1..*', '*', 'n'].map(v => <option key={v} value={v} />)}
      </datalist>
    </div>
  );
}
