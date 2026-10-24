import { create } from 'zustand';

let nodeIdCounter = 1;
let relIdCounter = 1;

const DEFAULT_CLASS = () => ({
  id: `class-${nodeIdCounter++}`,
  name: 'NewClass',
  stereotype: '', // <<interface>>, <<abstract>>, <<enum>>
  x: 100 + Math.random() * 300,
  y: 100 + Math.random() * 200,
  width: 200,
  fields: [
    { id: `f-${Math.random()}`, visibility: '-', name: 'id', type: 'int', isStatic: false },
  ],
  methods: [
    { id: `m-${Math.random()}`, visibility: '+', name: 'getName', returnType: 'String', params: '', isStatic: false, isAbstract: false },
  ],
});

const LOAD_KEY = 'uml-diagram-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(LOAD_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveState(classes, relationships) {
  try {
    localStorage.setItem(LOAD_KEY, JSON.stringify({ classes, relationships }));
  } catch (_) {}
}

// Sample diagram matching the professor's example (Student class)
const SAMPLE_CLASSES = [
  {
    id: 'class-sample-1',
    name: 'Student',
    stereotype: '',
    x: 80,
    y: 120,
    width: 210,
    height: 160,
    fields: [
      { id: 'f-s1', visibility: '-', name: 'studid', type: 'int', isStatic: false },
      { id: 'f-s2', visibility: '+', name: 'name', type: 'String', isStatic: false },
      { id: 'f-s3', visibility: '#', name: 'age', type: 'int', isStatic: false },
    ],
    methods: [
      { id: 'm-s1', visibility: '+', name: 'learn', returnType: 'String', params: '', isStatic: false, isAbstract: false },
    ],
  },
];

const saved = loadState();

const useDiagramStore = create((set, get) => ({
  classes: saved?.classes || SAMPLE_CLASSES,
  relationships: saved?.relationships || [],
  selectedId: null,
  selectedRelId: null,
  drawingRel: null, // { sourceId, relType }
  zoom: 1,
  panX: 0,
  panY: 0,

  // ─── Classes ────────────────────────────────────────────────
  addClass: () => {
    const cls = DEFAULT_CLASS();
    set(s => {
      const classes = [...s.classes, cls];
      saveState(classes, s.relationships);
      return { classes, selectedId: cls.id, selectedRelId: null };
    });
  },

  deleteClass: (id) => {
    set(s => {
      const classes = s.classes.filter(c => c.id !== id);
      const relationships = s.relationships.filter(r => r.sourceId !== id && r.targetId !== id);
      saveState(classes, relationships);
      return { classes, relationships, selectedId: null };
    });
  },

  updateClass: (id, patch) => {
    set(s => {
      const classes = s.classes.map(c => c.id === id ? { ...c, ...patch } : c);
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  moveClass: (id, x, y) => {
    set(s => {
      const classes = s.classes.map(c => c.id === id ? { ...c, x, y } : c);
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  // ─── Fields ─────────────────────────────────────────────────
  addField: (classId) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return {
          ...c,
          fields: [...c.fields, { id: `f-${Date.now()}`, visibility: '-', name: 'field', type: 'int', isStatic: false }],
        };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  updateField: (classId, fieldId, patch) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, fields: c.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f) };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  deleteField: (classId, fieldId) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, fields: c.fields.filter(f => f.id !== fieldId) };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  // ─── Methods ────────────────────────────────────────────────
  addMethod: (classId) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return {
          ...c,
          methods: [...c.methods, { id: `m-${Date.now()}`, visibility: '+', name: 'method', returnType: 'void', params: '', isStatic: false, isAbstract: false }],
        };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  updateMethod: (classId, methodId, patch) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, methods: c.methods.map(m => m.id === methodId ? { ...m, ...patch } : m) };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  deleteMethod: (classId, methodId) => {
    set(s => {
      const classes = s.classes.map(c => {
        if (c.id !== classId) return c;
        return { ...c, methods: c.methods.filter(m => m.id !== methodId) };
      });
      saveState(classes, s.relationships);
      return { classes };
    });
  },

  // ─── Relationships ──────────────────────────────────────────
  startDrawingRel: (sourceId, relType) => {
    set({ drawingRel: { sourceId, relType }, selectedId: null, selectedRelId: null });
  },

  cancelDrawingRel: () => set({ drawingRel: null }),

  addRelationship: (targetId) => {
    const { drawingRel, relationships, classes } = get();
    if (!drawingRel || drawingRel.sourceId === targetId) {
      set({ drawingRel: null });
      return;
    }
    const rel = {
      id: `rel-${relIdCounter++}`,
      sourceId: drawingRel.sourceId,
      targetId,
      type: drawingRel.relType,
      sourceMultiplicity: '',
      targetMultiplicity: '',
      label: '',
    };
    const newRels = [...relationships, rel];
    saveState(classes, newRels);
    set({ relationships: newRels, drawingRel: null, selectedRelId: rel.id });
  },

  updateRelationship: (id, patch) => {
    set(s => {
      const relationships = s.relationships.map(r => r.id === id ? { ...r, ...patch } : r);
      saveState(s.classes, relationships);
      return { relationships };
    });
  },

  deleteRelationship: (id) => {
    set(s => {
      const relationships = s.relationships.filter(r => r.id !== id);
      saveState(s.classes, relationships);
      return { relationships, selectedRelId: null };
    });
  },

  // ─── Selection ──────────────────────────────────────────────
  select: (id) => set({ selectedId: id, selectedRelId: null, drawingRel: null }),
  selectRel: (id) => set({ selectedRelId: id, selectedId: null }),
  clearSelection: () => set({ selectedId: null, selectedRelId: null }),

  // ─── Viewport ───────────────────────────────────────────────
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.3, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),

  // ─── Canvas Operations ──────────────────────────────────────
  clearCanvas: () => {
    saveState([], []);
    set({ classes: [], relationships: [], selectedId: null, selectedRelId: null });
  },
}));

export default useDiagramStore;
