import {
  AlertTriangle,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Target,
  WalletCards,
} from "lucide-react";

import type { NavigationItem } from "./navigation.types";

export const navigationItems: NavigationItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    children: [],
    expandable: false,
  },

  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    children: [
      {
        id: "student-enrollment",
        label: "Student Enrollment",
      },
      {
        id: "attendance-rates",
        label: "Attendance Rates",
      },
      {
        id: "academic-performance",
        label: "Academic Performance",
      },
      {
        id: "parent-access",
        label: "Parent Access (My Child's Progress)",
      },
      {
        id: "library-resource-usage",
        label: "Library & Resource Usage",
      },
    ],
  },

  {
    id: "operations",
    label: "Operational",
    icon: Landmark,
    children: [
      {
        id: "facilities-maintenance",
        label: "Facilities & Maintenance",
      },
      {
        id: "fleet-transport",
        label: "Fleet & Transport",
      },
      {
        id: "ict-systems",
        label: "ICT Systems",
      },
      {
        id: "asset-management",
        label: "Asset Management",
      },
      {
        id: "work-orders",
        label: "Work Orders",
      },
    ],
  },

  {
    id: "service",
    label: "Services",
    icon: AlertTriangle,
    children: [
      {
        id: "open-incidents",
        label: "Open Incidents",
      },
      {
        id: "open-service-requests",
        label: "Open Service Requests",
      },
      {
        id: "sla-compliance",
        label: "SLA Compliance",
      },
      {
        id: "resolution-times",
        label: "Resolution Times",
      },
      {
        id: "escalation-rates",
        label: "Escalation Rates",
      },
      {
        id: "customer-satisfaction",
        label: "Customer Satisfaction",
      },
    ],
  },

  {
    id: "finance-procurement",
    label: "Finance & Procurement",
    icon: WalletCards,
    children: [
      {
        id: "revenue-fee-collection",
        label: "Revenue & Fee Collection",
      },
      {
        id: "budget-planning",
        label: "Budget & Planning",
      },
      {
        id: "expenditure-cost-centres",
        label: "Expenditure & Cost Centres",
      },
      {
        id: "financial-forecasting",
        label: "Financial Forecasting",
      },
      {
        id: "payments-financial-commitments",
        label: "Payments & Financial Commitments",
      },
      {
        id: "procurement-management",
        label: "Procurement Management",
      },
      {
        id: "suppliers-delivery",
        label: "Suppliers & Delivery",
      },
      {
        id: "inventory-procurement-resources",
        label: "Inventory & Procurement Resources",
      },
    ],
  },

  {
    id: "strategic-insights",
    label: "Strategic KPIs",
    icon: Target,
    children: [
      {
        id: "kpi-framework-management",
        label: "KPI Framework & Management",
      },
      {
        id: "executive-scorecard",
        label: "Executive Scorecard",
      },
      {
        id: "kpi-performance-trends",
        label: "KPI Performance & Trends",
      },
      {
        id: "strategic-alerts-exceptions",
        label: "Strategic Alerts & Exceptions",
      },
      {
        id: "executive-performance-review",
        label: "Executive Performance Review",
      },
    ],
  },
];