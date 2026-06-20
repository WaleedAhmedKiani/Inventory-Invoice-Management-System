import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomer } from "../services/customer.service";

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: any) => updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["customers"],
            });
        },
    });
};