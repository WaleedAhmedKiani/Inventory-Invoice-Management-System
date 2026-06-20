import { useState } from "react"; // Added for state management
import { useDashboard } from "../../hooks/useDashboard";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { markInvoicePaid } from "../../services/invoice.service";
import {
    DollarSign, FileText, Clock, CheckCircle2, Users,
    Package, History, TrendingUp, TrendingDown, Calendar, Eye, Check
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";


export default function Dashboard() {
    // 1. Manage range state to make the dashboard dynamic
    const [range, setRange] = useState("30d");
    const [loadingId, setLoadingId] = useState<string | null>(null); // For tracking which invoice is being updated
    const { data, isLoading, refetch } = useDashboard(range);
    const { user } = useAuthStore();



    const stats = data?.stats;
    const navigate = useNavigate();

    const handleMarkPaid = async (id: string) => {
        try {

            setLoadingId(id); 
            // call API from invoice.service to mark as paid
            await markInvoicePaid(id);

            // refetch dashboard
            refetch();
        } catch (err) {
            console.error(err);
        }
    };

    const statusStyles: { [key: string]: string } = {
        PAID: "bg-green-100 text-green-700",
        PENDING: "bg-amber-100 text-amber-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    if (isLoading) return (
        <div className="p-6 flex items-center justify-center h-64 text-gray-500 font-medium">
            <div className="animate-pulse">Loading Analytics...</div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">

            {/* Header with Range Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">DashBoard Analytics</h1>
                    <p className="text-gray-600 text-sm">Welcome Back, {user?.name}</p>
                </div>

                <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="text-sm font-medium bg-transparent outline-none cursor-pointer"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card
                    title="Total Revenue"
                    value={`$${Number(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="text-green-600"
                    growth={stats?.revenueGrowth}
                    chartData={stats?.revenueSparkline}
                />
                <Card
                    title="Pending Amount"
                    value={`$${Number(stats?.pendingRevenue || 0).toLocaleString()}`}
                    icon={Clock}
                    color="text-amber-600"
                />
                <Card
                    title="Total Invoices"
                    value={stats?.totalInvoices || 0}
                    icon={FileText}
                    color="text-blue-600"
                    growth={stats?.invoiceGrowth}
                    chartData={stats?.invoiceSparkline}
                />
                <Card
                    title="Paid Invoices"
                    value={stats?.paidInvoices || 0}
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    growth={stats?.paidInvoiceGrowth}
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Trend over time</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.monthlyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#000"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#000", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Grid: 12-Column System for Perfect Alignment */}
            <div className="grid grid-cols-12 gap-6 mt-6">

                {/* Top Customers - Spans 6 units (Half width) */}
                <div className="col-span-12 lg:col-span-6 bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Users className="w-5 h-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-800">Top Customers</h2>
                    </div>


                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data?.topCustomers || []}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Best Sellers - Spans 6 units (Half width) */}
                <div className="col-span-12 lg:col-span-6 bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Package className="w-5 h-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-800">Best Sellers</h2>
                    </div>



                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data?.topProducts || []}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="quantity" radius={[6, 6, 0, 0]} fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Transactions */}
                <div className="col-span-12 bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" />
                            <h2 className="font-bold text-gray-800">Recent Transactions</h2>
                        </div>
                        <button onClick={() => navigate("/invoices")} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                            <Eye className="w-4 h-4" />
                            View All
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left font-medium text-gray-400 border-b border-gray-50">
                                    <th className="pb-3 px-2 font-semibold">Customer</th>
                                    <th className="pb-3 px-2 font-semibold">Amount</th>
                                    <th className="pb-3 px-2 font-semibold">Status</th>
                                    <th className="pb-3 px-2 font-semibold">Date</th>
                                    <th className="pb-3 px-2 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.recentInvoices.map((inv: any) => (
                                    <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="hover:bg-gray-50/50 hover:shadow-sm transition-all cursor-pointer group">
                                        <td className="py-4 px-2 text-gray-700 font-medium">{inv.customerName}</td>
                                        <td className="py-4 px-2 text-gray-900 font-bold">
                                            ${inv.total.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles[inv.status] || "bg-gray-100 text-gray-700"}`}>
                                                {inv.status}
                                            </span>
                                        </td>

                                        <td className="py-4 px-2 text-gray-500 text-xs">
                                            {new Date(inv.createdAt).toLocaleDateString()}
                                        </td>
                                         
                                         
                                        <td
                                            className="py-4 px-2 text-right "
                                            onClick={(e) => e.stopPropagation()} // prevent row click
                                        >
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition"> 

                                            {/* View */}
                                            <button
                                                onClick={() => navigate(`/invoices/${inv.id}`)}
                                                className="p-1.5 rounded-md hover:bg-gray-100 transition"
                                            >
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </button>



                                            {/* Mark Paid */}
                                            {inv.status !== "PENDING" && (
                                                <button
                                                    onClick={() => handleMarkPaid(inv.id)}
                                                    className="p-1.5 rounded-md hover:bg-green-50 transition"
                                                >
                                                    <Check className={`w-4 h-4 ${loadingId === inv.id ? 'text-gray-400' : 'text-green-600'}`} />
                                                </button>
                                            )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, color, growth, chartData }: any) {


    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">

            {/* Top Row */}
            <div className="flex items-center gap-4">
                <div className={`p-3 bg-gray-50 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {title}
                    </p>
                    <h2 className="text-xl font-black text-gray-900">
                        {value}
                    </h2>
                </div>
            </div>

            {/* Sparkline Chart */}
            {chartData && (
                <div className="h-10 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={growth >= 0 || growth === null ? "#10b981" : "#ef4444"}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Growth Section */}
            {growth !== undefined && (
                <div className="flex items-center gap-1 text-sm">

                    {/* CASE 1: No previous data */}
                    {growth === null ? (
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            First Period
                        </span>
                    ) : (
                        <>
                            {/* CASE 2: Normal growth */}
                            {growth >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            )}

                            <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
                                {Math.abs(growth).toFixed(1)}%
                            </span>

                            <span className="text-gray-400 text-xs">
                                vs last period
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}