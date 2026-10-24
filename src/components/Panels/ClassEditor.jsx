import React from 'react';
import useDiagramStore from '../../store/diagramStore';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: '+', label: '+ public' },
  { value: '-', label: '− private' },
  { value: '#', label: '# protected' },
  { value: '~', label: '~ package' },
];

const STEREOTYPE_OPTIONS = [
  { value: '', label: 'class' },
  { value: '<<abstract>>', label: '<<abstract>>' },
  { value: '<<interface>>', label: '<<interface>>' },
  { value: '<<enum>>', label: '<<enum>>' },
];

const COMMON_TYPES = ['int', 'String', 'boolean', 'double', 'float', 'long', 'void', 'List', 'Map', 'Object'];

function VisSelect({ value, onChange, id }) {
  return (
    <select className="vis-select" value={value} onChange={e => onChange(e.target.value)} id={id} title="Visibility">
      {VISIBILITY_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function ClassEditor() {
  const {
    classes, selectedId,
    updateClass, deleteClass,
    addField, updateField, deleteField,
    addMethod, updateMethod, deleteMethod,
    startDrawingRel,
  } = useDiagramStore();

  const cls = classes.find(c => c.id === selectedId);
  if (!cls) {
    return (
      <div className="editor-panel empty-state">
        <div className="empty-icon">⬡</div>
        <div className="empty-title">No class selected</div>
        <div className="empty-sub">Click a class on the canvas to edit it, or add a new class from the toolbar.</div>
      </div>
    );
  }

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <span className="editor-title">Class Editor</span>
        <button
          id="btn-delete-class"
          className="icon-action danger"
          onClick={() => deleteClass(cls.id)}
          title="Delete class"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Class name */}
      <div className="editor-section">
        <label className="editor-label">Class Name</label>
        <input
          id="input-class-name"
          className="editor-input"
          value={cls.name}
          onChange={e => updateClass(cls.id, { name: e.target.value })}
          placeholder="ClassName"
          spellCheck={false}
        />
      </div>

      {/* Stereotype */}
      <div className="editor-section">
        <label className="editor-label">Stereotype</label>
        <select
          id="select-stereotype"
          className="editor-select"
          value={cls.stereotype}
          onChange={e => updateClass(cls.id, { stereotype: e.target.value })}
        >
          {STEREOTYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Fields */}
      <div className="editor-section">
        <div className="section-row">
          <label className="editor-label">Fields</label>
          <button
            id="btn-add-field"
            className="add-btn"
            onClick={() => addField(cls.id)}
            title="Add field"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        <div className="member-list">
          {cls.fields.map((f, i) => (
            <div key={f.id} className="member-row">
              <VisSelect
                id={`field-vis-${i}`}
                value={f.visibility}
                onChange={v => updateField(cls.id, f.id, { visibility: v })}
              />
              <input
                id={`field-name-${i}`}
                className="member-input name-input"
                value={f.name}
                onChange={e => updateField(cls.id, f.id, { name: e.target.value })}
                placeholder="name"
                spellCheck={false}
              />
              <span className="colon-sep">:</span>
              <input
                id={`field-type-${i}`}
                className="member-input type-input"
                value={f.type}
                onChange={e => updateField(cls.id, f.id, { type: e.target.value })}
                placeholder="type"
                list="java-types"
                spellCheck={false}
              />
              <label className="toggle-label" title="Static">
                <input
                  type="checkbox"
                  checked={f.isStatic}
                  onChange={e => updateField(cls.id, f.id, { isStatic: e.target.checked })}
                />
                <span className="toggle-text">S</span>
              </label>
              <button
                className="del-btn"
                onClick={() => deleteField(cls.id, f.id)}
                title="Remove field"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {cls.fields.length === 0 && <div className="no-members">No fields</div>}
        </div>
      </div>

      {/* Methods */}
      <div className="editor-section">
        <div className="section-row">
          <label className="editor-label">Methods</label>
          <button
            id="btn-add-method"
            className="add-btn"
            onClick={() => addMethod(cls.id)}
            title="Add method"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        <div className="member-list">
          {cls.methods.map((m, i) => (
            <div key={m.id} className="member-row method-row">
              <VisSelect
                id={`method-vis-${i}`}
                value={m.visibility}
                onChange={v => updateMethod(cls.id, m.id, { visibility: v })}
              />
              <input
                id={`method-name-${i}`}
                className="member-input name-input"
                value={m.name}
                onChange={e => updateMethod(cls.id, m.id, { name: e.target.value })}
                placeholder="methodName"
                spellCheck={false}
              />
              <span className="paren-sep">(</span>
              <input
                id={`method-params-${i}`}
                className="member-input params-input"
                value={m.params}
                onChange={e => updateMethod(cls.id, m.id, { params: e.target.value })}
                placeholder="params"
                spellCheck={false}
              />
              <span className="paren-sep">)</span>
              <span className="colon-sep">:</span>
              <input
                id={`method-return-${i}`}
                className="member-input type-input"
                value={m.returnType}
                onChange={e => updateMethod(cls.id, m.id, { returnType: e.target.value })}
                placeholder="void"
                list="java-types"
                spellCheck={false}
              />
              <div className="toggle-group">
                <label className="toggle-label" title="Static">
                  <input type="checkbox" checked={m.isStatic}
                    onChange={e => updateMethod(cls.id, m.id, { isStatic: e.target.checked })} />
                  <span className="toggle-text">S</span>
                </label>
                <label className="toggle-label" title="Abstract">
                  <input type="checkbox" checked={m.isAbstract}
                    onChange={e => updateMethod(cls.id, m.id, { isAbstract: e.target.checked })} />
                  <span className="toggle-text">A</span>
                </label>
              </div>
              <button className="del-btn" onClick={() => deleteMethod(cls.id, m.id)} title="Remove method">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {cls.methods.length === 0 && <div className="no-members">No methods</div>}
        </div>
      </div>

      {/* Connect from this class */}
      <div className="editor-section connect-section">
        <label className="editor-label">Draw Relationship From This Class</label>
        <div className="connect-btn-group">
          {['association', 'inheritance', 'implementation', 'aggregation', 'composition', 'dependency'].map(type => (
            <button
              key={type}
              id={`btn-draw-${type}`}
              className="connect-rel-btn"
              onClick={() => startDrawingRel(cls.id, type)}
              title={`Draw ${type}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <datalist id="java-types">
        {COMMON_TYPES.map(t => <option key={t} value={t} />)}
      </datalist>
    </div>
  );
}
