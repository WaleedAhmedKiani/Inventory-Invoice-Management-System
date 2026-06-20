import { api } from "../lib/api";

export const getCurrentSubscription = async () => {
  const res = await api.get("/subscription/current");
  return res.data.subscription;
};

export const createCheckoutSession = async () => {
  const res = await api.post("/subscription/checkout");
  return res.data;
};

export const createBillingPortal = async () => {
  const res = await api.post("/billing/portal");
  return res.data;
};