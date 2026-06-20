import { Link } from 'react-router-dom';
// import BillingPage from '../billing/BillingPage' <--- You don't need this here anymore!

const SettingPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="grid gap-4">
        {/* Profile Settings Section */}
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="font-semibold">Profile Information</h2>
          <p className="text-sm text-gray-500">Update your name and email.</p>
        </div>

        {/* The Billing Link */}
        <Link 
          to="/billing" 
          className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 flex justify-between items-center group"
        >
          <div>
            <h2 className="font-semibold">Billing & Subscription</h2>
            <p className="text-sm text-gray-500">Manage your plan and invoices.</p>
          </div>
          <span className="text-gray-400 group-hover:text-blue-500">→</span>
        </Link>
      </div>
    </div>
  );
};

export default SettingPage;