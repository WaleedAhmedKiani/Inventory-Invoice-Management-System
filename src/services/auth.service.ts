import { api } from "../lib/api";


export const registerUser = async (data: any) => {
  const res = await api.post("/auth/register", data);
  return res.data; 
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};



export const logoutUser = async () => {
  //  &call the backend to clear the HttpOnly cookie
  const res = await api.post("/auth/logout");
  return res.data;
};