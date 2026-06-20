export interface PlanLimitDetails {
  products: number | null;
  customers: number | null;
  invoices: number | null;
}

export const PLAN_LIMITS: { [key: string]: PlanLimitDetails } = {
  FREE: {
    products: 10,
    customers: 10,
    invoices: 10,
  },

  PRO: {
    products: null,
    customers: null,
    invoices: null,
  },
};