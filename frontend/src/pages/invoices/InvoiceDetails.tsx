import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getInvoiceById, downloadInvoicePdf } from "../../services/invoice.service";
import { useCancelInvoice, useMarkPaid } from "../../hooks/useCancelInvoice";
import { useDeleteInvoice } from "../../hooks/useDeleteInvoice";
import { ArrowLeft, Download, XCircle, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function InvoiceDetails() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { mutate: cancelMutate, isPending: cancelling } = useCancelInvoice();
    const { mutate: payMutate, isPending: paying } = useMarkPaid();
    const { mutate: deleteMutate, isPending: deleting } = useDeleteInvoice();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await getInvoiceById(id!);
                setInvoice(res.invoice);
            } catch (err) {
                toast.error("Failed to load invoice");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id]);

    const handleDownload = async () => {
        try {
            const blob = await downloadInvoicePdf(invoice.id);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${invoice.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("PDF downloaded");
        } catch {
            toast.error("Failed to download PDF");
        }
    };

    const handleCancel = () => {
        if (!confirm("Cancel this invoice?")) return;

        cancelMutate(invoice.id, {
            onSuccess: () => {
                toast.success("Invoice cancelled");
                setInvoice((prev: any) => ({ ...prev, status: "CANCELLED" }));
            },
            onError: () => toast.error("Cancel failed"),
        });
    };

    const handleMarkPaid = () => {
        payMutate(invoice.id, {
            onSuccess: () => {
                toast.success("Marked as PAID");
                setInvoice((prev: any) => ({ ...prev, status: "PAID" }));
            },
            onError: () => toast.error("Update failed"),
        });
    };

    const handleDelete = () => {
        if (!confirm("This will permanently delete the invoice. Continue?")) return;

        deleteMutate(invoice.id, {
            onSuccess: () => {
                toast.success("Invoice deleted");
                window.location.href = "/invoices";
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Delete failed");
            },
        });
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!invoice) return <div className="p-6">Invoice not found</div>;

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 box-border overflow-hidden">

        
            {/* BUTTONS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">

                {/* Title Context Group */}
                <div className="flex items-center gap-2">
                    <Link to="/invoices" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-sm md:text-2xl font-bold tracking-tight text-gray-900">Invoice Details</h1>
                        <p className="text-[10px] text-gray-400 font-medium">ID: #{invoice.id.substring(0, 8)}...</p>
                    </div>
                </div>

                {/* Small Compact Action Block - Perfect for tight viewports */}
                <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-1 bg-black text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer w-full sm:w-auto shadow-sm"
                    >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>PDF</span>
                    </button>

                    {invoice.status === "PENDING" && (
                        <>
                            <button
                                onClick={handleMarkPaid}
                                disabled={paying}
                                className="flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer w-full sm:w-auto shadow-sm disabled:opacity-50"
                            >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Paid</span>
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer w-full sm:w-auto shadow-sm disabled:opacity-50"
                            >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Cancel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* STATUS BADGE */}
            <div className="flex items-center">
                <span
                    className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider border ${invoice.status === "PAID"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : invoice.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                >
                    {invoice.status}
                </span>
            </div>

            {/* CUSTOMER CARD */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer Info</h2>
                <p className="font-bold text-gray-900 text-base">{invoice.customer.name}</p>
                <p className="text-sm text-gray-500 font-medium">{invoice.customer.email}</p>
            </div>

            {/* 🟢 FIXED ITEMS TABLE: Isolated horizontal table boundary container for mobile */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice Items</h2>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left table-auto">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4">Product</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {invoice.items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors text-gray-700 font-medium">
                                    <td className="p-4 text-gray-900 font-semibold whitespace-nowrap">{item.productName}</td>
                                    <td className="p-4 text-center text-gray-500 whitespace-nowrap">{item.quantity}</td>
                                    <td className="p-4 text-right text-gray-500 whitespace-nowrap">${item.price.toFixed(2)}</td>
                                    <td className="p-4 text-right text-gray-900 font-bold whitespace-nowrap">${item.lineTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SUMMARY INFO LAYOUT */}
            <div className="flex justify-end">
                <div className="w-full sm:w-80 bg-gray-50/50 border border-gray-100 p-5 rounded-2xl space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-gray-900">${invoice.financials.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Tax:</span>
                        <span className="font-semibold text-green-600">+${invoice.financials.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Discount:</span>
                        <span className="font-semibold text-red-500">-${invoice.financials.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-base text-gray-900">
                        <span>Total Paid:</span>
                        <span>${invoice.financials.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Delete Invoice Trigger */}
            {invoice.status === "PENDING" && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 text-xs sm:text-sm bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100/60 transition-colors shadow-sm cursor-pointer disabled:opacity-40"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Invoice Records</span>
                    </button>
                </div>
            )}
        </div>
    );
}