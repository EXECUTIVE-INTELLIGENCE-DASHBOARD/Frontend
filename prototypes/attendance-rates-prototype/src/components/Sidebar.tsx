import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  CalendarClock,
  Calculator,
  ChevronDown,
  Gauge,
  GraduationCap,
  Layers,
  LayoutGrid,
  Library,
  LifeBuoy,
  MessageSquare,
  ReceiptText,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Globe,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from './BrandMark';

interface NavLeaf {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutGrid,
    children: [],
  },
  {
    id: 'academics',
    label: 'Academics',
    icon: GraduationCap,
    children: [
      { id: 'attendance-rates', label: 'Attendance Rates', icon: CalendarCheck },
      { id: 'academic-overview', label: 'Academic Overview', icon: BookOpen },
      { id: 'student-enrolment', label: 'Student Enrolment', icon: Users },
      { id: 'academic-performance', label: 'Academic Performance', icon: TrendingUp },
      { id: 'parent-access', label: 'Parent Access (My Child)', icon: UserCheck },
      { id: 'library', label: 'Library & Resource Centre', icon: Library },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Procurement',
    icon: Wallet,
    children: [
      { id: 'budgeting', label: 'Budgeting & Planning', icon: Calculator },
      { id: 'procurement', label: 'Procurement', icon: BarChart3 },
      { id: 'fee-collection', label: 'Fee Collection', icon: ReceiptText },
    ],
  },
  {
    id: 'operational',
    label: 'Operational',
    icon: Building2,
    children: [
      { id: 'facilities', label: 'Facilities', icon: Building2 },
      { id: 'transport', label: 'Transport', icon: Bus },
      { id: 'timetabling', label: 'Timetabling', icon: CalendarClock },
    ],
  },
  {
    id: 'strategic-kpis',
    label: 'Strategic KPIs',
    icon: Target,
    children: [
      { id: 'scorecard', label: 'School Scorecard', icon: Gauge },
      { id: 'benchmarking', label: 'Benchmarking', icon: Target },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Layers,
    children: [
      { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy },
      { id: 'communications', label: 'Communications', icon: MessageSquare },
    ],
  },
];

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(['academics']);

  const toggle = (id: string, children: NavLeaf[]) => {
    if (children.length === 0) return;
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <BrandMark height={34} />
        <span className="sidebar__brand-text">
          <span className="sidebar__brand-name">GREENHILL</span>
          <span className="sidebar__brand-sub">Executive Information</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_SECTIONS.map((section) => {
          const expandable = section.children.length > 0;
          const isOpen = openSections.includes(section.id);
          const containsActive = section.children.some((c) => c.id === activeId);
          const isLeafActive = !expandable && section.id === activeId;

          const classNames = [
            'nav-item',
            isLeafActive ? 'is-active' : '',
            containsActive ? 'is-parent-active' : '',
            isOpen ? 'is-open' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div className="nav-group" key={section.id}>
              <button
                type="button"
                className={classNames}
                aria-expanded={expandable ? isOpen : undefined}
                onClick={() => (expandable ? toggle(section.id, section.children) : onSelect(section.id))}
              >
                <section.icon className="nav-item__icon" size={17} strokeWidth={1.9} aria-hidden />
                <span className="nav-item__label">{section.label}</span>
                {expandable && (
                  <ChevronDown className="nav-item__chevron" size={15} aria-hidden />
                )}
              </button>

              {expandable && isOpen && (
                <div className="nav-sub">
                  {section.children.map((child) => (
                    <button
                      type="button"
                      key={child.id}
                      className={`nav-item${child.id === activeId ? ' is-active' : ''}`}
                      aria-current={child.id === activeId ? 'page' : undefined}
                      onClick={() => onSelect(child.id)}
                    >
                      <child.icon className="nav-item__icon" size={15} strokeWidth={1.9} aria-hidden />
                      <span className="nav-item__label">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__locale">
          <Globe size={15} aria-hidden />
          <span>English — United States</span>
        </div>
      </div>
    </aside>
  );
}
