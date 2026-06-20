import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AlertBell from "../alerts/AlertBell";
import AlertDropdown from "../alerts/AlertDropdown";


export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [openAlerts, setOpenAlerts] = useState(false);
    const alertRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {

        await logout(); // logout from the backend and clear local state

        toast.success("Logged out successfully");

    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                alertRef.current &&
                !alertRef.current.contains(event.target as Node)
            ) {
                setOpenAlerts(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);



    return (
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div className="flex flex-row gap-2">
                <LayoutDashboard className="w-3 h-3 mt-1.5 sm:w-3 sm:h-3 sm:mt-1 md:w-4 md:h-4 md:mt-1 lg:w-5 lg:h-5 text-black" />
                <h1 className="text-xs md:text-sm lg:text-lg font-semibold  tracking-tight">DashBoard</h1>

            </div>


            <div className="flex items-center gap-3 md:gap-4">

                <div
                    ref={alertRef}
                    className="relative"
                >
                    <button
                        onClick={() =>
                            setOpenAlerts(!openAlerts)
                        }
                        className="flex items-center justify-center p-1"
                    >
                        <AlertBell />
                    </button>

                    {openAlerts && (
                        <div className="absolute right-0 top-12 z-50"
                            onClick={(e) => e.stopPropagation()}>
                            <AlertDropdown />
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <p className="text-xs md:text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 leading-tight">{user?.email}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-black text-white hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors cursor-pointer self-center"
                >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Logout</span>
                </button>


            </div>
        </div>
    );
}