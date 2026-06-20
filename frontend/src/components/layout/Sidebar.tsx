import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { MENU_ITEMS } from "../../constants/navigation";
import { useFeatureGate } from "../../hooks/useFeatureGate";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { pathname } = useLocation();
  const { isLocked } = useFeatureGate();

  const featureMap: Record<string, "products" | "customers" | "invoices"> = {
    Products: "products",
    Customers: "customers",
    Invoices: "invoices",
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-black p-2 rounded-lg text-white font-bold text-sm">SaaSS</div>
        <span className="font-bold text-sm tracking-tighter text-gray-900">Inventory & Invoice</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {MENU_ITEMS.filter((item) => item.roles.includes(user?.role as any)).map((item) => {
          const isActive = pathname === item.path;
          const feature = featureMap[item.name];
          const locked = feature ? isLocked(feature) : false;

          return (
            <Link
              key={item.path}
              to={item.path}
              
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }
              ${locked ? "opacity-50" : ""}
              `}
            >
              {/* Group icon and text safely together */}
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </div>

              {/* Badges sit independently on the far-right edge */}
              {locked && (
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}