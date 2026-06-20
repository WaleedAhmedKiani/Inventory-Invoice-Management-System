import { ArrowLeft, Mail, Phone, MapPin, User, Receipt, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomers } from "../../hooks/useCustomers";

const CustomerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Fetching data - assuming page 1 and no search to find the customer
    const { data, isLoading } = useCustomers(1, "");

    const customer = data?.data?.find((c: any) => c.id === id);

    // ---  CALCULATION LOGIC ---
    //  derive these values from the customer's invoice array
    const invoices = customer?.invoices || [];
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum: number, inv: any) => {
        const amount = inv.total_amount || inv.total || inv.amount || 0;
        return sum + Number(amount);
    }, 0);
    const isInactive = totalInvoices === 0;

    if (isLoading) {
        return <div className="p-12 text-center animate-pulse text-gray-500 font-bold">Loading customer profile...</div>;
    }

    if (!customer) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-red-500">Customer not found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline cursor-pointer">Go Back</button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-6 cursor-pointer transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
            </button>

            {/* Header Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-xl font-black text-white border border-gray-200">
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-0.5">{customer.name}</h1>
                        <p className="text-gray-500 font-medium">Customer ID: <span className="text-gray-400 font-mono text-xs">{customer.id}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold uppercase tracking-widest">Email Address</span>
                        </div>
                        <p className="font-semibold text-[12px] text-gray-900 break-all">{customer.email || "N/A"}</p>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-semibold uppercase tracking-widest">Phone Number</span>
                        </div>
                        <p className="font-semibold text-[12px] text-gray-900">{customer.phone || "N/A"}</p>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-semibold uppercase tracking-widest">Billing Address</span>
                        </div>
                        <p className="font-semibold text-[12px] text-gray-900">{customer.address || "No address provided"}</p>
                    </div>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Invoices</p>
                            <h2 className="text-xl font-black mt-2 text-gray-900">{totalInvoices}</h2>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50">
                            <Receipt className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
                            <h2 className="text-xl font-black mt-2 text-gray-900">${totalRevenue.toFixed(2)}</h2>
                        </div>
                        <div className="p-3 rounded-xl bg-green-50">
                            <DollarSign className="w-3.5 h-3.5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Status</p>
                            <h2 className={`text-xl font-black mt-2 ${isInactive ? 'text-gray-400' : 'text-green-600'}`}>
                                {isInactive ? 'Inactive' : 'Active'}
                            </h2>
                        </div>
                        <div className={`p-3 rounded-xl ${isInactive ? 'bg-gray-100' : 'bg-green-100'}`}>
                            <User className={`w-3.5 h-3.5 ${isInactive ? 'text-gray-400' : 'text-green-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice History Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-1">Invoice History</h2>
                <p className="text-sm text-gray-500 mb-6">All transactions associated with this customer.</p>

                {invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        {/* You can map your invoices here into a table later */}
                        <p className="text-sm text-green-600 font-bold">This customer has {invoices.length} invoices.</p>
                    </div>
                ) : (
                    <div className="py-14 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                        <Receipt className="w-10 h-10 mx-auto text-gray-200 mb-4" />
                        <h3 className="font-bold text-gray-900">No invoices yet</h3>
                        <p className="text-sm text-gray-500 mt-1">This customer has no recorded transaction history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetails;