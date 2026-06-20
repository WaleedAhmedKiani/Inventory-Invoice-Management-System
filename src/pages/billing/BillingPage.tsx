import toast from "react-hot-toast";
import { useSubscription } from "../../hooks/useSubscription";
import {createBillingPortal, createCheckoutSession } from "../../services/billing.service";
import { useSearchParams } from "react-router-dom";
import { usePlan } from "../../hooks/usePlan";
import { useEffect } from "react";

const BillingPage = () => {
  const { data: subscription, isLoading } = useSubscription();
  const planData = usePlan();

  const [searchParams] = useSearchParams();

  const handleUpgrade = async () => {
    try {
      const res = await createCheckoutSession();
      window.location.href = res.url;
    } catch {
      toast.error("Failed to start checkout");
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await createBillingPortal();
      window.location.href = res.url;
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Subscription activated successfully");
    }
    if (searchParams.get("canceled")) {
      toast.error("Checkout canceled");
    }
  }, [searchParams]);

  if (isLoading) return <div>Loading billing...</div>;

  const plan = subscription?.plan?.toUpperCase();
  const status = subscription?.status?.toUpperCase();

  const isPro =
    plan === "PRO" && ["ACTIVE", "TRIALING"].includes(status || "");

  const usage = planData?.organization?.usage || {
    products: 0,
    customers: 0,
    invoices: 0,
  };

  const limits = {
    products:
      planData?.organization?.limits?.products ??
      (isPro ? null : 10),

    customers:
      planData?.organization?.limits?.customers ??
      (isPro ? null : 10),

    invoices:
      planData?.organization?.limits?.invoices ??
      (isPro ? null : 10),
  };

  const getPercent = (used: number, limit: number | null) => {
    // Unlimited PRO
    if (limit === null) {
      return used > 0 ? 100 : 0;
    }

    if (limit <= 0) return 0;

    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (used: number, limit: number | null) => {
    if (!limit || limit <= 0) return "safe";

    const percent = (used / limit) * 100;

    if (percent >= 90) return "danger";
    if (percent >= 75) return "warning";
    return "safe";
  };

  const productStatus = getUsageStatus(
    usage.products,
    limits.products ?? 0
  );

  const customerStatus = getUsageStatus(
    usage.customers,
    limits.customers ?? 0
  );

  const invoiceStatus = getUsageStatus(
    usage.invoices,
    limits.invoices ?? 0
  );

  const hasWarning =
    productStatus === "warning" ||
    customerStatus === "warning" ||
    invoiceStatus === "warning";

  const hasDanger =
    productStatus === "danger" ||
    customerStatus === "danger" ||
    invoiceStatus === "danger";

  const getStatusColor = () => {
    if (status === "ACTIVE") return "text-green-600";
    if (status === "TRIALING") return "text-blue-600";
    if (status === "PAST_DUE") return "text-yellow-600";
    return "text-red-600";
  };

  type CTA = {
  type: "danger" | "warning";
  title: string;
  desc: string;
  button: string;
};

let cta: CTA | null = null;

if (hasDanger) {
  cta = {
    type: "danger",
    title: "Critical Usage Alert",
    desc: "You are close to your plan limits. Upgrade now to avoid interruption.",
    button: "Upgrade",
  };
} else if (hasWarning) {
  cta = {
    type: "warning",
    title: "Usage Warning",
    desc: "You are reaching your limits. Consider upgrading.",
    button: "Upgrade",
  };
}

  const UsageBar = ({ label, used, limit, status }: any) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {used} / {limit === null ? "∞" : limit}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${status === "danger"
              ? "bg-usage-danger"
              : status === "warning"
                ? "bg-usage-warning"
                : "bg-usage-safe"
            }`}
          style={{
            width: `${getPercent(used, limit)}%`,
          }}
        />
      </div>

      {!isPro && status !== "safe" && (
        <p className="text-xs mt-1 text-gray-500">
          {status === "danger"
            ? "⚠ You are critically close to your limit"
            : "⚡ You are approaching your limit"}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-gray-500 mt-1">Manage your subscription</p>
        </div>

        <div className="border rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <h2 className="text-3xl font-bold mt-2">
              {isPro ? "PRO" : "FREE"}
            </h2>
          </div>

          {status && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`font-semibold capitalize ${getStatusColor()}`}>
                {status.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold">Usage Overview</h3>

          <UsageBar
            label="Products"
            used={usage.products}
            limit={limits.products}
            status={productStatus}
          />

          <UsageBar
            label="Customers"
            used={usage.customers}
            limit={limits.customers}
            status={customerStatus}
          />

          <UsageBar
            label="Invoices"
            used={usage.invoices}
            limit={limits.invoices}
            status={invoiceStatus}
          />
        </div>

        {cta && !isPro && (
  <div
    className={`p-4 rounded-xl border flex justify-between items-center ${
      cta.type === "danger"
        ? "bg-red-50 border-red-200"
        : "bg-yellow-50 border-yellow-200"
    }`}
  >
    <div>
      <h3 className="font-bold">{cta.title}</h3>
      <p className="text-sm text-gray-700 mt-1">{cta.desc}</p>
    </div>

    <button
      onClick={handleUpgrade}
      className={`px-4 py-2 rounded-lg text-white text-[10px] cursor-pointer ${
        cta.type === "danger"
          ? "bg-red-600"
          : "bg-yellow-600"
      }`}
    >
      {cta.button }
    </button>
  </div>
)}

        {isPro ? (
          <button
            onClick={handleManageBilling}
            className="w-full bg-black text-white py-3 rounded-xl font-medium cursor-pointer hover:bg-gray-800"
          >
            Manage Billing
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            className={`w-full py-3 rounded-xl font-medium text-white cursor-pointer ${hasDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Upgrade to PRO
          </button>
        )}
      </div>
    </div>
  );
};

export default BillingPage;