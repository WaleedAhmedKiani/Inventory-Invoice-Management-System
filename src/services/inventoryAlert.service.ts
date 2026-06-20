
import { api } from "../lib/api";

export const getInventoryAlerts = async () => {
  const res = await api.get("/alerts/inventory");
  return res.data;
}