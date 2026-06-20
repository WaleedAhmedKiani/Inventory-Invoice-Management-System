import React from "react";
import { useCustomers } from "../../hooks/useCustomers";
import { useDeleteCustomer } from "../../hooks/useDeleteCustomer";
import { usePlan } from "../../hooks/usePlan";
import { Users, MoreVertical, UserPen, ChevronLeft, ChevronRight, Search, Edit3, Trash2, Eye, MapPin, Phone, Mail, User, Sliders, }
    from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerForm from "./CustomerForm";
import toast from "react-hot-toast";

const Customers = () => {
    // Pagination & Search States
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    // Modal & Action Menu
    const [open, setOpen] = React.useState(false);
    const [editingCustomer, setEditingCustomer] = React.useState<any | null>(null);
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

    // Hooks
    const navigate = useNavigate();
    const planData = usePlan();

    const { data, isLoading, isError } = useCustomers(
        page,
        debouncedSearch
    );

    const { mutate: deleteMutate } = useDeleteCustomer();

    // Backend Response
    const customers = data?.data || [];
    const pagination = data?.pagination;

    // Limits
    const customerLimit =
        planData?.organization?.limits?.customers ?? Infinity;

    const currentCustomers =
        planData?.organization?.usage?.customers ?? 0;

    const hasReachedLimit =
        customerLimit !== Infinity &&
        currentCustomers >= customerLimit;
    // Helpers
    const closeMenu = () => setActiveMenu(null);

    // Search Debounce
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    // Edit Customer
    const handleEdit = (customer: any) => {
        closeMenu();
        setEditingCustomer(customer);
        setOpen(true);
    };

    // Delete Customer
    const handleDelete = (id: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmDelete) return;

        deleteMutate(id, {
            onSuccess: () => {
                toast.success("Customer deleted successfully");
                closeMenu();
            },
            onError: () => {
                toast.error("Delete failed");
            },
        });
    };

    // Loading
    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <p className="text-gray-500 animate-pulse font-medium">
                    Loading customers...
                </p>
            </div>
        );
    }

    // Error
    if (isError) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 bg-red-50 p-4 rounded-xl inline-block border border-red-100">
                    Failed to load customers
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto relative">
            {/* ACTIVE MENU OVERLAY */}
            {activeMenu && (
                <div
                    className="fixed inset-0 z-10 bg-transparent cursor-default"
                    onClick={closeMenu}
                />
            )}

            {/* SOFT GATE BANNER */}
            {hasReachedLimit && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-yellow-900">
                            Customer Limit Reached
                        </h3>

                        <p className="text-sm text-yellow-700">
                            Upgrade to PRO for unlimited customers.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/settings/billing")}
                        className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                    >
                        Upgrade
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                {/* Left */}
                <div className="md:flex-1">
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-black" />
                        Customers
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage your client relationships.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-96 order-3 md:order-0">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search by customers..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                    />
                </div>

                {/* Add Button */}
                <div className="md:flex-1 flex justify-end">
                    <button
                        onClick={() => {
                            if (hasReachedLimit) {
                                toast.error(
                                    "Customer limit reached. Upgrade to PRO."
                                );

                                return;
                            }

                            navigate("/customers/create");
                        }}
                        disabled={hasReachedLimit}
                        className={`px-4 py-2 rounded-xl font-medium transition-all
                        ${hasReachedLimit
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                            }`}
                    >
                        {hasReachedLimit
                            ? "Limit Reached"
                            : "Add Customer"}
                    </button>
                </div>
            </div>

            {/* Table Wrapper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* FIXED: Removed overflow-y-visible which doesn't work with overflow-x-auto, 
        and added min-h-62.5 so a single row has plenty of native room for the dropdown to sit inside */}
                <div className="overflow-x-auto min-h-62.5">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Customer Name</span>
                                    </div>
                                </th>

                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>Email Address</span>
                                    </div>
                                </th>

                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Phone</span>
                                    </div>
                                </th>

                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Address</span>
                                    </div>
                                </th>

                                <th className="p-4 text-right font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Sliders className="w-3.5 h-3.5" /> Actions
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {customers.map((customer: any) => (
                                <tr
                                    key={customer.id}
                                    className="hover:bg-blue-50/30 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 uppercase">
                                                {customer.name?.charAt(0)}
                                            </div>

                                            <span className="font-bold text-gray-900">
                                                {customer.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4 text-gray-600 font-medium">
                                        {customer.email}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {customer.phone || (
                                            <span className="text-gray-300 italic">
                                                No phone
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 text-gray-500 max-w-xs truncate">
                                        {customer.address}
                                    </td>

                                    {/* FIXED: Removed overflow-visible on the <td> which breaks inside tables, 
                            and ensured relative positioning sits cleanly */}
                                    <td className="p-4 text-right relative">
                                        <button
                                            onClick={() =>
                                                setActiveMenu(
                                                    activeMenu === customer.id
                                                        ? null
                                                        : customer.id
                                                )
                                            }
                                            className={`p-2 rounded-lg transition-colors relative z-20 ${activeMenu === customer.id
                                                ? "bg-gray-100 text-black"
                                                : "text-gray-400 hover:text-black hover:bg-gray-50"
                                                }`}
                                        >
                                            <MoreVertical className="w-4 h-4 cursor-pointer" />
                                        </button>

                                        {activeMenu === customer.id && (
                                            <div
                                                className={`absolute right-4 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden ${customers.length > 1 &&
                                                    customers.indexOf(customer) >= customers.length - 1
                                                    ? "bottom-[80%] mb-1"
                                                    : "top-[80%] mt-1"
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100 font-medium cursor-pointer text-gray-700"
                                                >
                                                    <Edit3 className="w-2.5 h-2.5 text-blue-500" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-[12px] hover:bg-blue-50/50 transition-colors font-medium cursor-pointer text-gray-700"
                                                >
                                                    <Eye className="w-2.5 h-2.5 text-green-500" />
                                                    View
                                                </button>

                                                <div className="border-t border-gray-100" />

                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-[12px] text-red-500 hover:bg-red-50 font-bold cursor-pointer"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5 text-red-500" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {customers.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                            <Users className="w-8 h-8 text-gray-300" />
                        </div>

                        <h3 className="text-gray-900 font-bold">
                            No customers found
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Try adjusting your search terms or add a new client.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
                    Showing{" "}
                    <span className="text-black">
                        {customers.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-black">
                        {pagination?.total || 0}
                    </span>{" "}
                    Customers
                </div>

                <div className="flex items-center gap-3 order-1 sm:order-2">
                    <button
                        onClick={() =>
                            setPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>

                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-black">
                        {page}
                        <span className="text-gray-400 font-normal mx-1">
                            /
                        </span>
                        {pagination?.totalPages || 1}
                    </div>

                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={
                            !pagination ||
                            page >= pagination.totalPages
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <UserPen className="w-6 h-6 text-black" />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Edit Customer
                            </h2>
                        </div>

                        <CustomerForm
                            editingCustomer={editingCustomer}
                            setOpen={setOpen}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;