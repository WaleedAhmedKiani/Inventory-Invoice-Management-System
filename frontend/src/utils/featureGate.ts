type Plan = "FREE" | "PRO";

type Limits = {
  products: number | null;
  customers: number | null;
  invoices: number | null;
};

type Usage = {
  products: number;
  customers: number;
  invoices: number;
};

export const isProPlan = (plan?: Plan) => plan === "PRO";

export const isFeatureLocked = (
  plan?: Plan,
  usage?: Usage,
  limits?: Limits,
  feature?: keyof Usage
) => {
  if (plan === "PRO") return false;

  if (!usage || !limits || !feature) return false;

  const limit = limits[feature];

  if (limit === null || limit === undefined) return false;

  return usage[feature] >= limit;
};