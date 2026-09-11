import type { ReactNode } from 'react';

interface StudioFrameProps {
  children: ReactNode;
}

export function StudioFrame({ children }: StudioFrameProps) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="brand" aria-label="STUDIO">
          <span aria-hidden="true" className="brand-mark" />
          <span>STUDIO</span>
        </div>
        <nav aria-label="Primary navigation">
          <span>Work</span>
          <span>About</span>
          <span className="active">Contact</span>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
