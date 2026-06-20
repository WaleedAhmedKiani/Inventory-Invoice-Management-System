import { usePlan } from "./usePlan";
import { isFeatureLocked, isProPlan } from "../utils/featureGate";

export const useFeatureGate = () => {
  const planData = usePlan();

  const organization = planData?.organization;
  const plan = organization?.plan as any;

  return {
    isPro: isProPlan(plan),

    isLocked: (feature: "products" | "customers" | "invoices") =>
      isFeatureLocked(
        plan,
        organization?.usage,
        organization?.limits,
        feature
      ),

    planData: organization,
  };
};