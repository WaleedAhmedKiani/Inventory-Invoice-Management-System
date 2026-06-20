import { useForm } from "react-hook-form";
import { login, getProfile } from "../../services/auth.service";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await login(data);

      const profile = await getProfile();

      setUser(profile.user);
       toast.success("Login successful");

      navigate("/dashboard", { replace: true });
     
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
   <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
  
  {/* Header Section */}
  <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
    <div className="flex flex-col items-center">
      <div className="bg-black p-3 rounded-2xl mb-2 shadow-sm">
        <LogIn className="text-white w-7 h-7" />
      </div>
      
      <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
        Welcome Back
      </h2>
      
      <p className="mt-2 text-center text-[12px] text-gray-500">
        Please enter your details to access your dashboard
      </p>

      <Link
        to="/register" 
        className="mt-2 text-blue-600 text-[12px] font-semibold hover:underline underline-offset-4"
      >
        Don't have an account? Sign up
      </Link>
    </div>
  </div>

  {/* Form Section */}
  <div className="w-full max-w-md">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register("email")}
          placeholder="email@example.com"
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
        />
      </div>

      <button className="w-full bg-black text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition-colors active:scale-[0.98] cursor-pointer">
        Login
      </button>
    </form>
  </div>
</div>
  );
}