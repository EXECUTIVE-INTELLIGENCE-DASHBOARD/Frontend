import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  tools?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, subtitle, tools, children }: PanelProps) {
  return (
    <section className="panel">
      <header className="panel__head">
        <div>
          <h2 className="panel__title">{title}</h2>
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        {tools && <div className="panel__tools">{tools}</div>}
      </header>
      {children}
    </section>
  );
}
