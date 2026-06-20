import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useInvoices } from "../../hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { ReceiptText, Plus, Calendar, User, DollarSign, ChevronLeft, ChevronRight, List, Clock, CheckCircle2, XCircle, Search, Layers } from "lucide-react";




export default function Invoices() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("ALL");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { data, isLoading, error } = useInvoices(page, status, debouncedSearch, sortBy, order);
    console.log("API RESPONSE:", data);
    console.log("PAGINATION:", data?.pagination);

    const invoices = data?.data || [];
    const pagination = data?.pagination;
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400); // debounce delay

        return () => clearTimeout(timeout);
    }, [search]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">Error loading invoices</div>;

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <ReceiptText className="w-6 h-6 text-black" />
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                </div>

                <Link
                    to="/invoices/create"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Link>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                {/* Row 1: Status Badges (Scrolls beautifully on small screens, fits neatly on larger ones) */}
                <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-none snap-x">
                    {[
                        { label: "All", value: "ALL", icon: List },
                        { label: "Pending", value: "PENDING", icon: Clock },
                        { label: "Paid", value: "PAID", icon: CheckCircle2 },
                        { label: "Cancelled", value: "CANCELLED", icon: XCircle },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = status === item.value;

                        return (
                            <button
                                key={item.value}
                                onClick={() => {
                                    setStatus(item.value);
                                    setPage(1);
                                    setSearch("");
                                }}
                                className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all border shrink-0 snap-mini ${isActive
                                    ? "bg-black text-white border-black shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Row 2: Search Input & Sort Dropdowns aligned harmoniously together on tablets/md screens */}
                <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Search Input Container */}
                    <div className="relative w-full md:w-64 lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by customer..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>

                    {/* Fixed: Prevent select boxes from stretching layout when clicked/opened */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="flex-1 md:flex-none min-w-0 max-w-[50%] md:max-w-none px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-ellipsis overflow-hidden cursor-pointer"
                        >
                            <option value="createdAt">Date</option>
                            <option value="total">Amount</option>
                        </select>

                        <select
                            value={order}
                            onChange={(e) => {
                                setOrder(e.target.value);
                                setPage(1);
                            }}
                            className="flex-1 md:flex-none min-w-0 max-w-[50%] md:max-w-none px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-ellipsis overflow-hidden cursor-pointer"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Table Section */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-200">
                            <th className="p-3 md:p-4 font-bold text-gray-400 uppercase tracking-wider text-[10px] md:text-[12px]">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <User className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span>Customer Name</span>
                                </div>
                            </th>
                            <th className="p-3 md:p-4 font-bold text-gray-400 uppercase tracking-wider text-[10px] md:text-[12px]">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span>Total</span>
                                </div>
                            </th>
                            <th className="p-3 md:p-4 font-bold text-gray-400 uppercase tracking-wider text-[10px] md:text-[12px]">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <Layers className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span>Status</span>
                                </div>
                            </th>
                            <th className="p-3 md:p-4 font-bold text-gray-400 uppercase tracking-wider text-[10px] md:text-[12px]">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span>Date</span>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {invoices?.map((inv: any) => (
                            <tr
                                key={inv.id}
                                onClick={() => navigate(`/invoices/${inv.id}`)}
                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {inv.customerName}
                                </td>

                                <td className="p-6 text-gray-900 font-bold">
                                    ${inv.total.toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${inv.status === "PAID"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

            {/* Pagination */}

            <div className="flex items-center justify-between mt-6">
                {/* Prev Button */}
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border shadow-sm hover:shadow-md hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                </button>

                {/* Page Info */}
                <div className="text-sm text-gray-600 font-medium">
                    Page <span className="text-black">{pagination?.page}</span> of{" "}
                    <span className="text-black">{pagination?.totalPages}</span>
                </div>

                {/* Next Button */}
                <button
                    onClick={() =>
                        setPage((p) =>
                            pagination && p < pagination.totalPages ? p + 1 : p
                        )
                    }
                    disabled={page === pagination?.totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border shadow-sm hover:shadow-md hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}