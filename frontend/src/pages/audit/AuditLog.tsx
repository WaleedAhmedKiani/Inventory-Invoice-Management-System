import React from "react";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import {
    ShieldAlert, User, Calendar, PlusCircle, FileEdit, Trash2, HelpCircle, 
    Loader2, Database, Clock, Activity, Box, ChevronLeft, ChevronRight
} from "lucide-react";

const getActionBadge = (action: string) => {
    const normalized = action?.toUpperCase() || "";

    if (normalized.includes("CREATE") || normalized.includes("ADD")) {
        return {
            classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
            icon: <PlusCircle className="w-3.5 h-3.5 shrink-0" />
        };
    }
    if (normalized.includes("UPDATE") || normalized.includes("EDIT")) {
        return {
            classes: "bg-blue-50 text-blue-700 border-blue-100",
            icon: <FileEdit className="w-3.5 h-3.5 shrink-0" />
        };
    }
    if (normalized.includes("DELETE") || normalized.includes("REMOVE")) {
        return {
            classes: "bg-rose-50 text-rose-700 border-rose-100",
            icon: <Trash2 className="w-3.5 h-3.5 shrink-0" />
        };
    }

    return {
        classes: "bg-gray-50 text-gray-700 border-gray-200",
        icon: <HelpCircle className="w-3.5 h-3.5 shrink-0" />
    };
};

export default function AuditLogs() {
    const [page, setPage] = React.useState(1);
    const { data, isLoading } = useAuditLogs(page);
    console.log("React Query Data State:", data);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100 space-y-3 px-4">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
                <p className="text-sm font-medium text-gray-500">Loading security logs...</p>
            </div>
        );
    }

    const logs = data?.logs || [];
    const pagination = data?.pagination;

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 box-border overflow-hidden">

            {/* 🟢 RESPONSIVE HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-5">
                <div className="p-2.5 bg-black text-white rounded-xl shadow-xs self-start sm:self-center shrink-0">
                    <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and monitor security configuration and data alterations across your organization.</p>
                </div>
            </div>

            {/* Main Content Area */}
            {logs.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-8 sm:p-12 text-center bg-white shadow-xs">
                    <div className="inline-flex p-4 bg-gray-50 text-gray-400 rounded-full mb-4">
                        <Database className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No history found</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Activities inside this organization will automatically log here.</p>
                </div>
            ) : (
                <>
                    {/* 🟢 TABLE CONTAINMENT WITH MOBILE SCROLL CONTEXT */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm border-collapse table-auto">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-200">
                                        <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[11px] sm:text-[12px] text-left whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                                                <span>Timestamp</span>
                                            </div>
                                        </th>
                                        <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[11px] sm:text-[12px] text-left whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                                                <span>Actor</span>
                                            </div>
                                        </th>
                                        <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[11px] sm:text-[12px] text-left whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                                                <span>Operation</span>
                                            </div>
                                        </th>
                                        <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[11px] sm:text-[12px] text-left whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-3.5 h-3.5 text-gray-400 stroke-[2.5]" />
                                                <span>Target Entity</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {logs.map((log: any) => {
                                        const badge = getActionBadge(log.action);
                                        const logDate = new Date(log.createdAt);

                                        return (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors text-xs sm:text-sm">
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span>{logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs text-gray-400 ml-5.5 block mt-0.5">
                                                        {logDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>

                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200 shrink-0">
                                                            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{log.userName || "System Process"}</span>
                                                    </div>
                                                </td>

                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-xs font-semibold border rounded-lg uppercase tracking-wider ${badge.classes}`}>
                                                        {badge.icon}
                                                        {log.action}
                                                    </span>
                                                </td>

                                                <td className="p-4 min-w-37.5">
                                                    <span className="font-mono text-[10px] sm:text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md border border-gray-200/60 break-all inline-block max-w-full">
                                                        {log.entity}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/*  CUSTOMER/PRODUCT PAGINATION AT THE BOTTOM */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                        <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
                            Showing{" "}
                            <span className="text-black font-semibold">
                                {logs.length}
                            </span>{" "}
                            of{" "}
                            <span className="text-black font-semibold">
                                {pagination?.total || 0}
                            </span>{" "}
                            Logs
                        </div>

                        <div className="flex items-center gap-3 order-1 sm:order-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 shadow-xs hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]"
                            >
                                <ChevronLeft className="w-4 h-4 shrink-0" />
                                Prev
                            </button>

                            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-black select-none tracking-tight">
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
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 shadow-xs hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 shrink-0" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}