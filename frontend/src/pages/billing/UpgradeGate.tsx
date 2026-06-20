import { Link } from "react-router-dom";
import { Crown, Lock } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export default function UpgradeGate({
  title,
  description,
}: Props) {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-yellow-600" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-3xl font-black text-gray-900">
            Upgrade to PRO
          </h1>

          <Crown className="w-6 h-6 text-yellow-500" />
        </div>

        <p className="text-lg font-semibold text-gray-700">
          {title}
        </p>

        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {description}
        </p>

        <Link
          to="/settings/billing"
          className="mt-8 inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-all"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}