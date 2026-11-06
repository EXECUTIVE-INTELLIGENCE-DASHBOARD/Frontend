import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import {
  navigationItems,
  findNavigationParentId,
} from "../navigation/navigation.config";
import eidlogo from "../assets/eidlogo.png";

import "./Sidebar.css";

interface SidebarProps {
  /** Currently selected navigation id (controlled). Falls back to internal state. */
  activeItem?: string;
  /** Called when a navigable item is selected. */
  onSelectItem?: (id: string) => void;
}

export function Sidebar({ activeItem }: SidebarProps = {}) {
  const [openSection, setOpenSection] = useState<string | null>(() =>
    activeItem ? (findNavigationParentId(activeItem) ?? null) : null,
  );

  const selectedItem = activeItem;
  useEffect(() => {
    const parentId = activeItem ? findNavigationParentId(activeItem) : null;

    setOpenSection(parentId ?? null);
  }, [activeItem]);
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
          src={eidlogo}
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
              {isExpandable ? (
                <button
                  type="button"
                  className={[
                    "sidebar__button",
                    isOpen ? "sidebar__button--open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSectionToggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-submenu`}
                >
                  <Icon
                    className="sidebar__icon"
                    size={20}
                    aria-hidden="true"
                  />
                  <span className="sidebar__label">{item.label}</span>
                  <ChevronDown
                    className={
                      isOpen
                        ? "sidebar__chevron sidebar__chevron--open"
                        : "sidebar__chevron"
                    }
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Link
                  to={`/${item.id}`}
                  className={[
                    "sidebar__button",
                    isActive ? "sidebar__button--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className="sidebar__icon"
                    size={20}
                    aria-hidden="true"
                  />
                  <span className="sidebar__label">{item.label}</span>
                </Link>
              )}

              {isExpandable && isOpen && (
                <ul id={`${item.id}-submenu`} className="sidebar__submenu">
                  {item.children.map((child) => (
                    <li className="sidebar__submenu-item" key={child.id}>
                      <Link
                        to={`/${child.id}`}
                        className={
                          selectedItem === child.id
                            ? "sidebar__submenu-button sidebar__submenu-button--active"
                            : "sidebar__submenu-button"
                        }
                        aria-current={
                          selectedItem === child.id ? "page" : undefined
                        }
                      >
                        {child.label}
                      </Link>
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
