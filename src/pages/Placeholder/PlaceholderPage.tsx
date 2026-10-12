import { LayoutDashboard } from "lucide-react";

import "./PlaceholderPage.css";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="placeholder">
      <span className="placeholder__icon" aria-hidden="true">
        <LayoutDashboard size={26} />
      </span>

      <h1 className="placeholder__title">{title}</h1>

      <p className="placeholder__text">
        This workspace is scaffolded and ready. Wire this screen to its data
        source when the feature lands.
      </p>
    </div>
  );
}
