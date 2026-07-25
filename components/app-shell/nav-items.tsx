import {
  LayoutDashboard,
  Upload,
  BarChart3,
  MessageSquareText,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Bill", href: "/upload", icon: Upload },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Assistant", href: "/assistant", icon: MessageSquareText },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export const secondaryNavItems: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const logoutNavItem: NavItem = { label: "Logout", href: "/login", icon: LogOut };
