import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlan } from "../../hooks/usePlan";
import { useProducts } from "../../hooks/useProducts";
import { useCustomers } from "../../hooks/useCustomers";
import { useCreateInvoice } from "../../hooks/useCreateInvoice";
import toast from "react-hot-toast";
import { ReceiptText, Plus, ArrowLeft, Trash2, Crown, Percent, Tag } from "lucide-react";

export default function CreateInvoice() {
    // 🔍 FIXED 1: Extract data array safely to fix the empty row array crash bug
    const { data: productsResponse } = useProducts(1, "");
    const products = productsResponse?.products || [];

    const planData = usePlan();

    // Correct customer extraction
    const { data: customerResponse } = useCustomers(1, "");
    const customers = customerResponse?.data || [];

    const { mutate, isPending } = useCreateInvoice();
    const navigate = useNavigate();

    const [customerId, setCustomerId] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);

    // Soft limit logic (SaaS usage verification pattern)
    const invoiceLimit = planData?.organization?.limits?.invoices ?? Infinity;
    const currentInvoices = planData?.organization?.usage?.invoices || 0;
    const hasReachedLimit = invoiceLimit !== Infinity && currentInvoices >= invoiceLimit;

    const addItem = () => {
        if (hasReachedLimit) {
            toast.error("Invoice limit reached. Upgrade to PRO.");
            return;
        }
        setItems([...items, { productId: "", quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => {
        const product = products.find((p: any) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const total = Math.max(0, subtotal + tax - discount);

    const submit = () => {
        if (hasReachedLimit) {
            return toast.error("Invoice limit reached. Upgrade to PRO.");
        }

        if (!customerId || items.length === 0) {
            return toast.error("Please select a customer and add items");
        }

        const hasInvalidItems = items.some(
            item => !item.productId || item.quantity < 1
        );

        if (hasInvalidItems) {
            return toast.error("Invalid items detected");
        }

        mutate(
            { customerId, items, tax, discount },
            {
                onSuccess: () => {
                    toast.success("Invoice created successfully");
                    setCustomerId("");
                    setItems([]);
                    setTax(0);
                    setDiscount(0);
                    setTimeout(() => navigate("/invoices"), 800);
                },
                onError: (error: any) => {
                    console.log("Full Error Object:", error);
                    const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
                    toast.error(serverMessage || "Check browser inspect console for details");
                }
            }
        );
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 box-border overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/invoices" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2">
                    <ReceiptText className="w-6 h-6" />
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">New Invoice</h1>
                </div>
            </div>

            {/* Soft PRO Banner */}
            {hasReachedLimit && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            <p className="font-bold text-yellow-800 text-sm">Limit Reached</p>
                        </div>
                        <p className="text-xs md:text-sm text-yellow-700">
                            You’ve reached your invoice limit ({invoiceLimit}).
                        </p>
                    </div>

                    <Link
                        to="/settings/billing"
                        className="bg-black text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors shrink-0"
                    >
                        Upgrade
                    </Link>
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm space-y-6">

                {/* Customer Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Customer
                    </label>
                    <select
                        className="border border-gray-200 p-2.5 rounded-xl w-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                    >
                        <option value="">Select a Customer...</option>
                        {customers.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Items
                        </label>

                        <button
                            onClick={addItem}
                            className="flex items-center gap-1.5 text-xs bg-black text-white px-3 py-1.5 rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Item
                        </button>
                    </div>

                    {items.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                            No items added yet. Click 'Add Item' to start.
                        </p>
                    )}

                    {items.map((item, i) => (
                        <div key={i} className="flex gap-2 md:gap-3 items-center">
                            {/* Product Selector */}
                            <select
                                className="border border-gray-200 p-2 rounded-xl flex-1 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer min-w-0"
                                value={item.productId}
                                onChange={(e) => updateItem(i, "productId", e.target.value)}
                            >
                                <option value="">Select Product</option>
                                {products.map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (${p.price})
                                    </option>
                                ))}
                            </select>

                            {/* Quantity Input with mobile baseline safety sizing */}
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-xl w-16 md:w-20 text-center text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                value={item.quantity}
                                min={1}
                                onChange={(e) =>
                                    updateItem(i, "quantity", Number(e.target.value) || 1)
                                }
                            />

                            {/* Delete Action Row */}
                            <button
                                onClick={() => removeItem(i)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    
                    {/* Inputs Column */}
                    <div className="space-y-4">
                        {/* Tax Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Tax
                            </label>
                            <div className="relative w-full">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={tax}
                                    onChange={(e) => setTax(Number(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        {/* Discount Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Discount
                            </label>
                            <div className="relative w-full">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 🔍 FIXED 2: Added structural alignment to your empty block to align calculations cleanly */}
                    <div className="flex flex-col justify-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax Added:</span>
                            <span className="font-semibold text-green-600">+${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Discount Deducted:</span>
                            <span className="font-semibold text-red-500">-${discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2.5 border-t border-gray-200 font-bold text-base text-gray-900">
                            <span>Total Amount:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Form Action Submit Button */}
                <button
                    onClick={submit}
                    disabled={isPending}
                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isPending ? "Creating Invoice..." : "Create Invoice"}
                </button>
            </div>
        </div>
    );
}