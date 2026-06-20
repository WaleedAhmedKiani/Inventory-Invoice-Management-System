import { usePlan } from "./usePlan";
import { isFeatureLocked, isProPlan } from "../utils/featureGate";

export const useFeatureGate = () => {
  const planData = usePlan();

  const organization = planData?.organization;

  return {
    isPro: isProPlan(organization?.plan),

    isLocked: (feature: "products" | "customers" | "invoices") =>
      isFeatureLocked(
        organization?.plan,
        organization?.usage,
        organization?.limits,
        feature
      ),

    planData: organization,
  };
};