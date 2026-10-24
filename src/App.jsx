import React, { useState, useEffect, useCallback } from 'react';
import Canvas from './components/Canvas/Canvas';
import Toolbar from './components/Panels/Toolbar';
import ClassEditor from './components/Panels/ClassEditor';
import RelationshipEditor from './components/Panels/RelationshipEditor';
import CodePanel from './components/Panels/CodePanel';
import useDiagramStore from './store/diagramStore';
import './App.css';

export default function App() {
  const [activeRelType, setActiveRelType] = useState(null);
  const [showCode, setShowCode] = useState(true);
  const { selectedRelId, drawingRel, cancelDrawingRel, startDrawingRel, selectedId } = useDiagramStore();

  // Start drawing relationship when activeRelType set and a class is selected
  // (actually we do it from ClassEditor "Draw from this class" buttons)
  // But also: if toolbar rel type is active and user clicks canvas class, draw
  const handleSetActiveRelType = useCallback((type) => {
    setActiveRelType(type);
    if (!type) cancelDrawingRel();
  }, [cancelDrawingRel]);

  // ESC cancels drawing
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        cancelDrawingRel();
        setActiveRelType(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelDrawingRel]);

  // Show right panel based on selection
  const showRelEditor = !!selectedRelId;
  const showClassEditor = !!selectedId || (!selectedRelId && !selectedId);

  return (
    <div className="app-layout">
      <Toolbar
        activeRelType={activeRelType}
        setActiveRelType={handleSetActiveRelType}
        onShowCode={() => setShowCode(v => !v)}
        showCode={showCode}
      />
      <div className="app-body">
        {/* Canvas */}
        <div className="canvas-wrapper">
          <Canvas activeRelType={activeRelType} />
        </div>

        {/* Right panel: class or relationship editor */}
        <aside className="right-panel">
          {showRelEditor ? <RelationshipEditor /> : <ClassEditor />}
        </aside>

        {/* Bottom code panel */}
        {showCode && (
          <div className="code-panel-wrapper">
            <CodePanel onClose={() => setShowCode(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
