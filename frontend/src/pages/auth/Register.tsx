import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../features/auth/registerSchema";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth.service";
import { UserPlus } from "lucide-react";

export default function Register() {

    const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: any) => {

        try {
            const res = await registerUser(data);
            setUser(res.user);

            toast.success("Account created successfully!");
            navigate("/dashboard", { replace: true });

        } catch (error: any) {
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex flex-col items-center">
                    {/* Minimal Icon Branding */}
                    <div className="bg-black p-3 rounded-2xl mb-2 shadow-sm">
                        <UserPlus className="text-white w-7 h-7" />
                    </div>

                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>

                    <p className="mt-2 text-center text-[12px] text-gray-500">
                        Join the platform to start managing your invoices and products
                    </p>
                </div>
                <Link
                    to="/login"
                    className="flex flex-col items-center text-blue-600 mt-2 text-center text-[12px] font-semibold hover:underline underline-offset-4"
                >
                    Already have an account?
                </Link>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input
                                    {...register("name")}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1">
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
                            </div>
                        </div>

                        {/* Organization */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                            <div className="mt-1">
                                <input
                                    {...register("organizationName")}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="Company Inc."
                                />
                                {errors.organizationName && <p className="mt-1 text-xs text-red-500">{errors.organizationName.message as string}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message as string}</p>}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="mt-1">
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message as string}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {isSubmitting ? "Creating Account..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}