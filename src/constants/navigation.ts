import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  ClipboardList,
  Settings 
} from "lucide-react";

export const MENU_ITEMS = [
  { 
    name: "Dashboard", 
    path: "/dashboard", 
    icon: LayoutDashboard, 
    roles: ["OWNER", "ADMIN", "STAFF"] 
  },
  { 
    name: "Invoices", 
    path: "/invoices", 
    icon: FileText, 
    roles: ["OWNER", "ADMIN", "STAFF"] 
  },
  { 
    name: "Products", 
    path: "/products", 
    icon: Package, 
    roles: ["OWNER", "ADMIN"] 
  },
  { 
    name: "Customers", 
    path: "/customers", 
    icon: Users, 
    roles: ["OWNER", "ADMIN", "STAFF"] 
  },
   { 
    name: "Audit Logs", 
    path: "/audit-logs", 
    icon: ClipboardList, 
    roles: ["OWNER", "ADMIN"] 
  },
  { 
    name: "Setting", 
    path: "/settings/billing", 
    icon: Settings, 
    roles: ["OWNER"] 
  },
];