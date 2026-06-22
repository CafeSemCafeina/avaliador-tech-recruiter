import React, { useState } from 'react';

export function Tooltip({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '12px',
          width: '320px',
          background: 'var(--surface-inverse)',
          color: 'var(--text-inverse)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
          lineHeight: '1.5',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          textAlign: 'left'
        }}>
          <div style={{ position: 'absolute', top: '-4px', right: '24px', width: '8px', height: '8px', background: 'var(--surface-inverse)', transform: 'rotate(45deg)' }} />
          {content}
        </div>
      )}
    </div>
  );
}
