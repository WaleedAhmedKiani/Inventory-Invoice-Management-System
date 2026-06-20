import { api } from "../lib/api";

// frontend/services/product.service.ts

export const getproducts = async (page: number, search: string) => {
    const res = await api.get("/products", {
        params: {
            page,
            search: search || undefined, 
        }
    });
    
    return res.data; // Return the 'products' array from the response data
};

export const createProduct = async (data: FormData) => {
  const res = await api.post("/products", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.product;
};

export const updateProduct = async (id: string, data: FormData) => {
  const res = await api.put(`/products/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.product;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
