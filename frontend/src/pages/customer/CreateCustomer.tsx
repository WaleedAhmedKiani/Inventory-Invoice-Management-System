import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerForm from "../../pages/customer/CustomerForm";

const CreateCustomer = () => {
  const navigate = useNavigate();

  return (
    // Responsive background padding: p-4 on mobile, p-6 on tablet, p-10 on desktop
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-5 sm:mb-8">
          {/* Responsive Button: Smaller text, tighter padding, and less margin on mobile */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-400 hover:text-black transition-colors mb-3 sm:mb-6 py-1 pr-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1 cursor-pointer" />
            Back to Customers
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Icon: Hidden on very small screens to save space, visible from 'sm' up */}
            <div className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-black rounded-2xl items-center justify-center shadow-lg shadow-black/20 shrink-0">
              <UserPlus className="w-6 h-6 sm:w-4 sm:h-4 text-white" />
            </div>
            
            <div>
              {/* Responsive Text: text-xl on mobile, text-3xl on desktop */}
              <h1 className=" sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                New Customer
              </h1>
              <p className="text-base sm:text-[10px] text-gray-500 font-medium mt-0.5 sm:mt-0">
                Set up a new client profile for your organization.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          {/* Subtle Window Detail: Hidden on mobile to reduce clutter */}
          <div className="hidden sm:flex p-1 bg-gray-50/50 border-b border-gray-100 gap-1">
             <div className="h-2 w-2 rounded-full bg-gray-200 ml-3 my-2" />
             <div className="h-2 w-2 rounded-full bg-gray-200 my-2" />
             <div className="h-2 w-2 rounded-full bg-gray-200 my-2" />
          </div>
          
          {/* Responsive Form Padding: p-4 on mobile, p-8 on tablet, p-10 on desktop */}
          <div className="p-4 sm:p-8 lg:p-10">
            <CustomerForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomer;