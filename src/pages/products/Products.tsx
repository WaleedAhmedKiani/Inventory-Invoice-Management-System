import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../features/products/productSchema";
import { useProducts } from "../../hooks/useProducts";
import { usePlan } from "../../hooks/usePlan";
import { useCreateProduct } from "../../hooks/useCreateProduct";
import { useDeleteProduct } from "../../hooks/useDeleteProduct";
import { useUpdateProduct } from "../../hooks/useUpdateProduct";
import toast from "react-hot-toast";
import { 
    Package, Plus, MoreVertical, Edit3, Trash2, Image as ImageIcon, 
    ChevronLeft, ChevronRight, Search, UserPen, X, Hash, DollarSign, Layers3, Sliders
} from "lucide-react";

export default function Products() {
    // --- Pagination & Search States ---
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    // --- Modal & Action Menu States ---
    const [open, setOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<any | null>(null);
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState("");

    // --- Hooks & Mutations ---
    const { data, isLoading, error } = useProducts(page, debouncedSearch);
    const planData = usePlan();

    const { mutate, isPending } = useCreateProduct();
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateProduct();
    const { mutate: deleteMutate } = useDeleteProduct();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(productSchema),
    });

    // --- Backend Response Extraction ---
    const products = data?.products || [];
    const pagination = data?.pagination;

    // --- Derived Plan States ---
    const productLimit = planData.organization?.limits?.products ?? Infinity;
    const currentProducts = planData.organization?.usage?.products || 0;
    const hasReachedLimit = productLimit !== Infinity && currentProducts >= productLimit;

    // --- Helpers ---
    const closeMenu = () => setActiveMenu(null);

    const handleCloseModal = () => {
        setOpen(false);
        setEditingProduct(null);
        setSelectedImage(null);
        setImagePreview("");
        reset();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- Search Debounce Effect ---
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    // --- Sync Form When Editing ---
    React.useEffect(() => {
        if (editingProduct) {
            reset({
                name: editingProduct.name,
                price: editingProduct.price,
                stock: editingProduct.stock,
                sku: editingProduct.sku || "",
                barcode: editingProduct.barcode || "",
            });
            if (editingProduct.imageUrl) {
                setImagePreview(editingProduct.imageUrl);
            }
        }
    }, [editingProduct, reset]);

    // --- Action Handlers ---
    const onSubmit = (formDataValues: any) => {
        const actionOptions = {
            onSuccess: () => {
                toast.success(editingProduct ? "Product Updated" : "Product Created");
                handleCloseModal();
            },
            onError: () => toast.error("Operation failed")
        };

        const formData = new FormData();
        formData.append("name", formDataValues.name);
        formData.append("price", String(formDataValues.price));
        formData.append("stock", String(formDataValues.stock));
        formData.append("sku", formDataValues.sku || "");
        formData.append("barcode", formDataValues.barcode || "");

        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        if (editingProduct) {
            updateMutate({ id: editingProduct.id, data: formData }, actionOptions);
        } else {
            mutate(formData, actionOptions);
        }
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Delete this product?")) return;

        deleteMutate(id, {
            onSuccess: () => {
                toast.success("Product deleted");
                closeMenu();
            },
            onError: () => toast.error("Delete failed")
        });
    };

    const handleEditTrigger = (product: any) => {
        setEditingProduct(product);
        setOpen(true);
        closeMenu();
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <p className="text-gray-500 animate-pulse font-medium">Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500 bg-red-50 p-4 rounded-xl inline-block border border-red-100">
                    Failed to load products
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto relative">
            {activeMenu && (
                <div className="fixed inset-0 z-10 bg-transparent cursor-default" onClick={closeMenu} />
            )}

            {hasReachedLimit && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-amber-900">Product limit reached</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Your FREE plan allows only {productLimit} products. Upgrade to PRO for unlimited products.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/settings/billing"}
                        className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all cursor-pointer"
                    >
                        Upgrade
                    </button>
                </div>
            )}

            {/* Header Content Block - flex-wrap safe parameters applied */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 flex-wrap">
                <div className="md:flex-1 min-w-50">
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Package className="w-6 h-6" />
                        Products
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your full inventory list.</p>
                </div>

                <div className="relative w-full md:w-96 order-3 md:order-0">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                    />
                </div>

                <div className="md:flex-1 flex justify-end min-w-35">
                    <button
                        onClick={() => {
                            if (hasReachedLimit) {
                                toast.error("Product limit reached. Upgrade to PRO.");
                                return;
                            }
                            setEditingProduct(null);
                            setOpen(true);
                        }}
                        disabled={hasReachedLimit}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                        ${hasReachedLimit
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        {hasReachedLimit ? "Limit Reached" : "Add Product"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-62.5">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5" /> Product Name
                                    </div>
                                </th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-3.5 h-3.5" /> Image
                                    </div>
                                </th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-3.5 h-3.5" /> Price
                                    </div>
                                </th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Layers3 className="w-3.5 h-3.5" /> Stock Status
                                    </div>
                                </th>
                                <th className="p-4 font-bold text-gray-400 uppercase tracking-widest text-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5" /> SKU
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
                            {products.map((product: any) => {
                                let stockBadgeClass = "bg-green-50 text-green-700 border border-green-100";
                                let stockText = `${product.stock} In Stock`;

                                if (product.stock === 0) {
                                    stockBadgeClass = "bg-red-50 text-red-700 border border-red-100 font-bold animate-pulse";
                                    stockText = "Out of Stock";
                                } else if (product.stock <= 5) {
                                    stockBadgeClass = "bg-amber-50 text-amber-700 border border-amber-100 font-semibold";
                                    stockText = `${product.stock} Low Stock`;
                                }

                                return (
                                    <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-6 font-bold text-gray-900">{product.name}</td>
                                        <td className="p-6">
                                            {product.imageUrl ? (
                                                <a 
                                                    href={product.imageUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    title="Open image in new tab"
                                                >
                                                    <img 
                                                        src={product.imageUrl} 
                                                        alt={product.name} 
                                                        className="w-10 h-10 object-cover rounded-lg shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity" 
                                                    />
                                                </a>
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-gray-900 font-bold">${Number(product.price).toFixed(2)}</td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stockBadgeClass}`}>
                                                {stockText}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            {product.sku ? (
                                                <span className="inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wider">
                                                    {product.sku}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                                                className={`p-2 rounded-lg transition-colors relative z-20 ${activeMenu === product.id ? "bg-gray-100 text-black" : "text-gray-400 hover:text-black hover:bg-gray-50"}`}
                                            >
                                                <MoreVertical className="w-4 h-4 cursor-pointer" />
                                            </button>

                                            {activeMenu === product.id && (
                                                <div className={`absolute right-4 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden ${products.length > 1 && products.indexOf(product) >= products.length - 1 ? "bottom-[80%] mb-1" : "top-[80%] mt-1"}`}>
                                                    <button onClick={() => handleEditTrigger(product)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100 font-medium cursor-pointer text-gray-700">
                                                        <Edit3 className="w-2.5 h-2.5 text-blue-500" /> Edit
                                                    </button>
                                                    <div className="border-t border-gray-100" />
                                                    <button onClick={() => handleDelete(product.id)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-[12px] text-red-500 hover:bg-red-50 font-bold cursor-pointer">
                                                        <Trash2 className="w-2.5 h-2.5 text-red-500" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {products.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                            <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-bold">No products found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search terms or add a new item.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls Block - Synced perfectly with Customer page logic */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-gray-500 font-medium order-2 sm:order-1">
                    Showing{" "}
                    <span className="text-black">
                        {products.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-black">
                        {pagination?.total || 0}
                    </span>{" "}
                    Products
                </div>

                <div className="flex items-center gap-3 order-1 sm:order-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
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

            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg"><UserPen className="w-6 h-6 text-black" /></div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingProduct ? "Edit Product" : "Add Product"}
                                </h2>
                            </div>
                            <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name *</label>
                                <input 
                                    type="text" 
                                    {...register("name")} 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                                {errors.name?.message && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price ($) *</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        {...register("price", { valueAsNumber: true })} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    />
                                    {errors.price?.message && <p className="text-red-500 text-xs mt-1">{String(errors.price.message)}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Stock (Units) *</label>
                                    <input 
                                        type="number" 
                                        {...register("stock", { valueAsNumber: true })} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    />
                                    {errors.stock?.message && <p className="text-red-500 text-xs mt-1">{String(errors.stock.message)}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">SKU</label>
                                    <input 
                                        type="text" 
                                        {...register("sku")} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    />
                                    {errors.sku?.message && <p className="text-red-500 text-xs mt-1">{String(errors.sku.message)}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Barcode</label>
                                    <input 
                                        type="text" 
                                        {...register("barcode")} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                    />
                                    {errors.barcode?.message && <p className="text-red-500 text-xs mt-1">{String(errors.barcode.message)}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Image</label>
                                <div className="mt-1 flex items-center gap-4 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    {imagePreview ? (
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => { setSelectedImage(null); setImagePreview(""); }}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl border border-dashed border-gray-200 flex items-center justify-center bg-white text-gray-400">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                    <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                        Choose File
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending || isUpdating} 
                                    className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer transition-all"
                                >
                                    {isPending || isUpdating ? "Saving..." : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}