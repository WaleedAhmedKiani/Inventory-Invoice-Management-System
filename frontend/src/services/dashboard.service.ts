import { api } from "../lib/api";

export const getDashboard = async (range = "30d") => {
  const res = await api.get(`/dashboard?range=${range}`);
  return res.data;
};