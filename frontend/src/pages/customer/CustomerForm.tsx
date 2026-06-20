import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin } from "lucide-react";
import type { CustomerFormData } from "../../features/customer/Customer.Schema";
import { customerSchema } from "../../features/customer/Customer.Schema";
import { useCreateCustomer } from "../../hooks/useCreateCustomer";
import { useUpdateCustomer } from "../../hooks/useUpdateCustomer";
import { toast } from "react-hot-toast";

interface Props {
    editingCustomer?: any;
    setOpen?: (open: boolean) => void;
}

const CustomerForm = ({ editingCustomer, setOpen }: Props) => {
    const navigate = useNavigate();
    const { mutate, isPending } = useCreateCustomer();
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateCustomer();

    const { register, handleSubmit, reset, formState: { errors }, } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });

    const onSubmit = (data: CustomerFormData) => {
        if (editingCustomer) {
            updateMutate(
                {
                    id: editingCustomer.id,
                    data,
                },
                {
                    onSuccess: () => {
                        toast.success("Customer updated successfully");
                        setOpen?.(false);
                    },
                    onError: () => {
                        toast.error("Update failed");
                    },
                }
            );
        } else {
            mutate(data, {
                onSuccess: () => {
                    toast.success("Customer created successfully");
                    reset();
                    navigate("/customers");
                },
                onError: () => {
                    toast.error("Create failed");
                },
            });
        }
    };

    React.useEffect(() => {
        if (editingCustomer) {
            reset({
                name: editingCustomer.name,
                email: editingCustomer.email,
                phone: editingCustomer.phone,
                address: editingCustomer.address,
            });
        }
    }, [editingCustomer, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Customer Name
                </label>
                <div className="relative">
                    <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Enter full name"
                        {...register("name")}
                        className={`w-full border rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 ${errors.name
                                ? "border-red-500 focus:ring-red-100"
                                : "border-gray-200 focus:ring-black/5 focus:border-black"
                            }`}
                    />
                </div>
                {errors.name && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        placeholder="example@company.com"
                        {...register("email")}
                        className="w-full border border-gray-200 rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-black/5 focus:border-black"
                    />
                </div>
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Phone Number
                </label>
                <div className="relative">
                    <Phone className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        {...register("phone")}
                        className="w-full border border-gray-200 rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-black/5 focus:border-black"
                    />
                </div>
            </div>

            {/* Address */}
            <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Billing Address
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 sm:left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                        rows={3}
                        placeholder="Enter full street address..."
                        {...register("address")}
                        className="w-full border border-gray-200 rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
                    />
                </div>
            </div>

            {/* Action Buttons: Stacked nicely on mobile, side-by-side on tablet/desktop */}
            {/* Action Buttons: Stacked top and bottom across all devices */}
            <div className="flex flex-col gap-2.5 pt-3 sm:pt-2">
                {/* Submit Button (Top) */}
                <button
                    type="submit"
                    disabled={isPending || isUpdating}
                    className="w-full bg-black text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/5 active:scale-[0.98]"
                >
                    {editingCustomer
                        ? isUpdating
                            ? "Updating..."
                            : "Update Customer"
                        : isPending
                            ? "Creating..."
                            : "Create Customer"}
                </button>

                {/* Cancel Button (Bottom) */}
                <button
                    type="button"
                    onClick={() => {
                        if (editingCustomer) {
                            setOpen?.(false);
                        } else {
                            navigate("/customers");
                        }
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent active:scale-[0.98]"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;