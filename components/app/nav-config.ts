import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Sparkles,
  FileText,
  Bell,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Primary navigation shown in the sidebar, in display order.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Bill", href: "/upload-bill", icon: Upload },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];
