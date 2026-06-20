

export const getSubscriptionAlerts = async (user: any) => {
  const org = user.organization;

  const alerts: any[] = [];

  if (!org) return { success: true, count: 0, alerts: [] };

  const limits = org.limits;
  const usage = org.usage;

  
  // *PLAN LIMIT REACHED
  
  if (limits?.products && usage?.products >= limits.products) {
    alerts.push({
      type: "PLAN_LIMIT_REACHED",
      severity: "critical",
      module: "PRODUCTS",
      message: "Product limit reached",
      usage: usage.products,
      limit: limits.products,
    });
  }

  if (limits?.customers && usage?.customers >= limits.customers) {
    alerts.push({
      type: "PLAN_LIMIT_REACHED",
      severity: "critical",
      module: "CUSTOMERS",
      message: "Customer limit reached",
      usage: usage.customers,
      limit: limits.customers,
    });
  }

  if (limits?.invoices && usage?.invoices >= limits.invoices) {
    alerts.push({
      type: "PLAN_LIMIT_REACHED",
      severity: "critical",
      module: "INVOICES",
      message: "Invoice limit reached",
      usage: usage.invoices,
      limit: limits.invoices,
    });
  }

  
  // *TRIAL ENDING (placeholder logic)
  
  if (org.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(org.trialEndsAt);

    const daysLeft =
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && daysLeft > 0) {
      alerts.push({
        type: "TRIAL_ENDING",
        severity: "warning",
        message: `Trial ending in ${daysLeft} day(s)`,
        daysLeft,
      });
    }

    if (daysLeft <= 0) {
      alerts.push({
        type: "SUBSCRIPTION_INACTIVE",
        severity: "critical",
        message: "Trial expired. Subscription inactive.",
      });
    }
  }

  return {
    success: true,
    count: alerts.length,
    alerts,
  };
};