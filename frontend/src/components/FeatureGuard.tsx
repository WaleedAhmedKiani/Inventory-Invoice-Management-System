import type { ReactNode } from "react";
import { usePlan } from "../hooks/usePlan";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function FeatureGuard({ children, fallback }: Props) {
  const { isPro } = usePlan();

  if (!isPro) {
    return (
      fallback || (
        <div className="p-4 border rounded-xl bg-gray-50 text-gray-600">
          This feature requires PRO plan
        </div>
      )
    );
  }

  return <>{children}</>;
}