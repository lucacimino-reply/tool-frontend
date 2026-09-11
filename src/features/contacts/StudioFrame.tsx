import type { ReactNode } from 'react';

interface StudioFrameProps {
  children: ReactNode;
  mainClassName?: string;
}

export function StudioFrame({ children, mainClassName }: StudioFrameProps) {
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
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
