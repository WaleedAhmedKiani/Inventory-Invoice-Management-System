import { Bell } from "lucide-react";
import { useInventoryAlerts } from "../../hooks/useInventoryAlerts";

export default function AlertBell() {
  const { data } = useInventoryAlerts();

  const count = data?.count || 0;

  return (
    <div className="relative cursor-pointer">
      <Bell className="w-5 h-5" />

      {count > 0 && (
        <span
          className="
            absolute
            -top-2
            -right-2
            bg-red-500
            text-white
            text-[10px]
            rounded-full
            min-w-4.5
            h-4.5
            flex
            items-center
            justify-center
            font-bold
          "
        >
          {count}
        </span>
      )}
    </div>
  );
}