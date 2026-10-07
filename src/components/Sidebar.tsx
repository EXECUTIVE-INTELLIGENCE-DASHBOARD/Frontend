import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { navigationItems } from "../navigation/navigation.config";
import executivelogo from "../assets/executivelogo.png";

import "./Sidebar.css";

export function Sidebar() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const handleSectionToggle = (sectionId: string) => {
    setOpenSection((currentSection) =>
      currentSection === sectionId ? null : sectionId,
    );
  };

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Sidebar branding */}
      <div className="sidebar-brand">
        <img
          src={executivelogo}
          alt="GreenHill logo"
          className="sidebar-brand__logo"
        />

        <div className="sidebar-brand__content">
          <span className="sidebar-brand__name">GREENHILL</span>

          <span className="sidebar-brand__subtitle">EXECUTIVE INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation */}
      <ul>
        {navigationItems.map((item) => {
          const isOpen = openSection === item.id;
          const Icon = item.icon;
          const isExpandable = item.expandable !== false;

          return (
            <li className="sidebar__item" key={item.id}>
              <button
                type="button"
                className={
                  isOpen
                    ? "sidebar__button sidebar__button--open"
                    : "sidebar__button"
                }
                onClick={() =>
                  isExpandable ? handleSectionToggle(item.id) : undefined
                }
                aria-expanded={isExpandable ? isOpen : undefined}
                aria-controls={isExpandable ? `${item.id}-submenu` : undefined}
              >
                <Icon className="sidebar__icon" size={20} aria-hidden="true" />

                <span className="sidebar__label">{item.label}</span>

                {isExpandable && (
                  <ChevronDown
                    className={
                      isOpen
                        ? "sidebar__chevron sidebar__chevron--open"
                        : "sidebar__chevron"
                    }
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </button>

              {isExpandable && isOpen && (
                <ul id={`${item.id}-submenu`} className="sidebar__submenu">
                  {item.children.map((child) => (
                    <li className="sidebar__submenu-item" key={child.id}>
                      <button
                        type="button"
                        className={
                          activeItem === child.id
                            ? "sidebar__submenu-button sidebar__submenu-button--active"
                            : "sidebar__submenu-button"
                        }
                        onClick={() => setActiveItem(child.id)}
                      >
                        {child.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
