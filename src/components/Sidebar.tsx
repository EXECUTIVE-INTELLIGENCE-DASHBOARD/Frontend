import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  navigationItems,
  findNavigationParentId,
} from "../navigation/navigation.config";
import executivelogo from "../assets/executivelogo.png";

import "./Sidebar.css";

interface SidebarProps {
  /** Currently selected navigation id (controlled). Falls back to internal state. */
  activeItem?: string;
  /** Called when a navigable item is selected. */
  onSelectItem?: (id: string) => void;
}

export function Sidebar({ activeItem, onSelectItem }: SidebarProps = {}) {
  const [openSection, setOpenSection] = useState<string | null>(() =>
    activeItem ? (findNavigationParentId(activeItem) ?? null) : null,
  );
  const [internalActive, setInternalActive] = useState<string | null>(null);

  const selectedItem = activeItem ?? internalActive;

  const handleSectionToggle = (sectionId: string) => {
    setOpenSection((currentSection) =>
      currentSection === sectionId ? null : sectionId,
    );
  };

  const handleSelect = (id: string) => {
    setInternalActive(id);
    onSelectItem?.(id);
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

          <span className="sidebar-brand__subtitle">
            EXECUTIVE INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ul>
        {navigationItems.map((item) => {
          const isOpen = openSection === item.id;
          const Icon = item.icon;
          const isExpandable = item.expandable !== false;
          const isActive = selectedItem === item.id;

          return (
            <li className="sidebar__item" key={item.id}>
              <button
                type="button"
                className={[
                  "sidebar__button",
                  isOpen ? "sidebar__button--open" : "",
                  !isExpandable && isActive ? "sidebar__button--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  isExpandable
                    ? handleSectionToggle(item.id)
                    : handleSelect(item.id)
                }
                aria-expanded={isExpandable ? isOpen : undefined}
                aria-controls={isExpandable ? `${item.id}-submenu` : undefined}
                aria-current={!isExpandable && isActive ? "page" : undefined}
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
                          selectedItem === child.id
                            ? "sidebar__submenu-button sidebar__submenu-button--active"
                            : "sidebar__submenu-button"
                        }
                        onClick={() => handleSelect(child.id)}
                        aria-current={
                          selectedItem === child.id ? "page" : undefined
                        }
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
