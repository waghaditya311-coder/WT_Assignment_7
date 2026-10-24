import React, { useState, useMemo } from 'react';
import useDiagramStore from '../../store/diagramStore';
import { generateAllCode } from '../../utils/javaGenerator';
import { Copy, Download, Check, ChevronDown, ChevronRight } from 'lucide-react';

function CodeBlock({ name, code }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting (simple tokenizer)
  const highlighted = highlightJava(code);

  return (
    <div className={`code-block ${open ? 'open' : ''}`}>
      <div className="code-block-header" onClick={() => setOpen(!open)}>
        <span className="code-chevron">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="code-filename">{name}.java</span>
        <div className="code-actions" onClick={e => e.stopPropagation()}>
          <button className="code-btn" onClick={handleCopy} title="Copy code" id={`btn-copy-${name}`}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button className="code-btn" onClick={handleDownload} title="Download .java file" id={`btn-download-${name}`}>
            <Download size={13} />
            <span>Download</span>
          </button>
        </div>
      </div>
      {open && (
        <pre
          className="code-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}

// Simple Java syntax highlighter
function highlightJava(code) {
  const keywords = ['public', 'private', 'protected', 'class', 'interface', 'abstract', 'extends',
    'implements', 'static', 'final', 'void', 'return', 'new', 'this', 'super', 'import', 'package',
    'enum', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'null', 'true', 'false'];
  const types = ['int', 'String', 'boolean', 'double', 'float', 'long', 'char', 'byte', 'short',
    'Integer', 'Boolean', 'Double', 'Float', 'Long', 'Object', 'List', 'Map', 'Set', 'ArrayList'];

  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  escaped = escaped.replace(/(\/\/.+)/g, '<span class="hl-comment">$1</span>');
  // Strings
  escaped = escaped.replace(/"([^"]*)"/g, '<span class="hl-string">"$1"</span>');
  // Keywords
  keywords.forEach(kw => {
    escaped = escaped.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="hl-keyword">$1</span>');
  });
  // Types
  types.forEach(t => {
    escaped = escaped.replace(new RegExp(`\\b(${t})\\b`, 'g'), '<span class="hl-type">$1</span>');
  });
  // Numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

  return escaped;
}

export default function CodePanel({ onClose }) {
  const { classes, relationships } = useDiagramStore();
  const [copyAll, setCopyAll] = useState(false);

  const generatedFiles = useMemo(() => {
    return generateAllCode(classes, relationships);
  }, [classes, relationships]);

  const allCode = generatedFiles.map(f => `// ${f.name}.java\n${f.code}`).join('\n\n');

  const handleCopyAll = () => {
    navigator.clipboard.writeText(allCode).then(() => {
      setCopyAll(true);
      setTimeout(() => setCopyAll(false), 2000);
    });
  };

  const handleDownloadAll = () => {
    const blob = new Blob([allCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UML_Classes.java';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div className="code-panel-title">
          <span className="code-panel-icon">☕</span>
          <span>Generated Java Code</span>
          <span className="code-file-count">{generatedFiles.length} file{generatedFiles.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="code-panel-actions">
          <button id="btn-copy-all" className="code-btn accent" onClick={handleCopyAll}>
            {copyAll ? <Check size={13} /> : <Copy size={13} />}
            <span>{copyAll ? 'Copied All!' : 'Copy All'}</span>
          </button>
          <button id="btn-download-all" className="code-btn accent" onClick={handleDownloadAll}>
            <Download size={13} />
            <span>Download All</span>
          </button>
        </div>
      </div>

      <div className="code-panel-body">
        {generatedFiles.length === 0 ? (
          <div className="code-empty">
            <div className="code-empty-icon">☕</div>
            <div className="code-empty-text">Add classes to the diagram to generate Java code</div>
          </div>
        ) : (
          generatedFiles.map(f => (
            <CodeBlock key={f.name} name={f.name} code={f.code} />
          ))
        )}
      </div>
    </div>
  );
}
