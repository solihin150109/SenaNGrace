import React, { useState, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import AdminLayout from "../components/AdminLayout";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Tag,
  Package,
  Layers,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Brand } from "../types";

// Curated luxury presets for instant 1-click selection
const PRESET_BRAND_IMAGES = [
  { label: "Louis Vuitton", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" },
  { label: "Charles & Keith", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80" },
  { label: "Gucci", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" },
  { label: "Chanel", url: "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&w=800&q=80" },
  { label: "Hermes", url: "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&w=800&q=80" },
  { label: "Prada", url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80" },
  { label: "Dior", url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80" },
  { label: "Coach", url: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a4a5?auto=format&fit=crop&w=800&q=80" },
  { label: "Saint Laurent", url: "https://images.unsplash.com/photo-1598532187856-3c2243d5f0cc?auto=format&fit=crop&w=800&q=80" },
  { label: "Bottega Veneta", url: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80" }
];

export default function AdminBrand() {
  const { brands, addBrand, updateBrand, deleteBrand, products } = useApp();

  // Core state
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url" | "presets">("file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  
  const [validationError, setValidationError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setBrandName("");
    setBrandImage("");
    setUploadMode("file");
    setValidationError("");
    setShowModal(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setBrandName(b.namaBrand);
    setBrandImage(b.gambar || "");
    setUploadMode(b.gambar?.startsWith("data:") ? "file" : "url");
    setValidationError("");
    setShowModal(true);
  };

  const handleRequestDelete = (id: string) => {
    setDeletingBrandId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingBrandId) {
      const hasProducts = products.some(p => p.brandId === deletingBrandId);
      if (hasProducts) {
        setValidationError("Gagal menghapus brand. Masih terdapat produk tas yang menggunakan brand ini.");
        setShowDeleteConfirm(false);
        triggerToast("Gagal: Brand masih memiliki produk aktif.");
        return;
      }

      deleteBrand(deletingBrandId);
      triggerToast("Brand berhasil dihapus.");
      setShowDeleteConfirm(false);
      setDeletingBrandId(null);
    }
  };

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setValidationError("File yang dipilih harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBrandImage(e.target.result as string);
        setValidationError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!brandName.trim()) {
      setValidationError("Nama brand tidak boleh kosong.");
      return;
    }

    if (editingBrand) {
      updateBrand({
        id: editingBrand.id,
        namaBrand: brandName.trim(),
        gambar: brandImage.trim() || undefined
      });
      triggerToast(`Brand "${brandName}" berhasil diperbarui.`);
    } else {
      addBrand(brandName.trim(), brandImage.trim() || undefined);
      triggerToast(`Brand "${brandName}" berhasil ditambahkan.`);
    }

    setShowModal(false);
  };

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const q = searchQuery.toLowerCase().trim();
    return brands.filter(b => b.namaBrand.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  }, [brands, searchQuery]);

  return (
    <AdminLayout pageTitle="Manajemen Brand">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12100E] text-[#FAF9F6] border border-[#B39274]/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Brand Taxonomy &amp; Showcase</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1916]">Manajemen Brand &amp; Display Landing Page</h1>
            <p className="text-xs text-[#7C634F] font-normal">
              Kelola nama brand premium dan unggah foto display yang tampil elegan pada landing page dan katalog reseller.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-xs tracking-wider uppercase font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer shadow-sm hover:shadow-md"
            id="btn-add-brand"
          >
            <Plus size={16} />
            <span>Tambah Brand &amp; Foto</span>
          </button>
        </div>
      </section>

      {/* SEARCH & STATS PANEL */}
      <section className="border-b border-[#EAE6DF] bg-[#FAF9F6] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B3A69C]">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID atau nama brand..."
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-medium"
              id="brand-search-input"
            />
          </div>

          <div className="text-xs text-[#7C634F] font-semibold flex items-center gap-2">
            <Layers size={14} className="text-[#B39274]" />
            <span>Total {filteredBrands.length} Brand Terdaftar</span>
          </div>
        </div>
      </section>

      {/* BRANDS DATA TABLE */}
      <section className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] text-[10px] tracking-widest uppercase text-[#7C634F] border-b border-[#EAE6DF] font-bold">
                  <th className="py-3.5 px-6">Foto Display Landing Page</th>
                  <th className="py-3.5 px-6">Nama Brand Fashion</th>
                  <th className="py-3.5 px-4 text-center">ID Brand</th>
                  <th className="py-3.5 px-6 text-center">Jumlah Produk Tas</th>
                  <th className="py-3.5 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] text-xs">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[#7C634F]">
                      <Tag size={32} className="mx-auto text-[#B3A69C] mb-2 opacity-50" />
                      <p className="font-semibold text-sm text-[#1E1916]">Brand tidak ditemukan</p>
                      <p className="text-xs text-[#7C634F] mt-0.5">Coba kata kunci pencarian yang berbeda atau tambah brand baru.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((b) => {
                    const productCount = products.filter(p => p.brandId === b.id).length;
                    const displayImg = b.gambar || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80";

                    return (
                      <tr key={b.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                        {/* Brand Photo Column */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-[#EAE6DF] bg-neutral-100 shrink-0 group">
                              <img
                                src={displayImg}
                                alt={b.namaBrand}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-[#B39274] uppercase tracking-wider block">
                                {b.gambar ? "Foto Custom Aktif" : "Foto Default"}
                              </span>
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Sparkles size={10} className="text-[#B39274]" />
                                Tampil di Beranda
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Brand Name Column */}
                        <td className="py-3.5 px-6 font-bold text-[#1E1916] text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#EAE6DF] flex items-center justify-center text-[#B39274]">
                              <Tag size={13} />
                            </div>
                            <span>{b.namaBrand}</span>
                          </div>
                        </td>

                        {/* Brand ID Column */}
                        <td className="py-3.5 px-4 text-center font-mono text-[#7C634F] font-semibold text-[11px]">
                          <span className="bg-[#FAF9F6] border border-[#EAE6DF] px-2 py-0.5 rounded-md">
                            {b.id}
                          </span>
                        </td>

                        {/* Product Count Column */}
                        <td className="py-3.5 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            productCount > 0 
                              ? "bg-[#FAF9F6] text-[#1E1916] border border-[#EAE6DF]" 
                              : "bg-[#FAF9F6] text-[#7C634F] border border-[#EAE6DF]"
                          }`}>
                            <Package size={12} className="text-[#B39274]" />
                            <span>{productCount} produk</span>
                          </span>
                        </td>

                        {/* Action Buttons Column */}
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-2 text-[#7C634F] hover:text-[#1E1916] hover:bg-[#FAF9F6] border border-[#EAE6DF] hover:border-[#1E1916] rounded-xl transition-all cursor-pointer"
                              title="Edit Brand & Foto Display"
                              id={`btn-edit-brand-${b.id}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleRequestDelete(b.id)}
                              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-[#EAE6DF] hover:border-stone-400 rounded-xl transition-all cursor-pointer"
                              title="Hapus Brand"
                              id={`btn-delete-brand-${b.id}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BRAND MODAL (WITH PHOTO UPLOAD) */}
      {showModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-[#EAE6DF] shadow-2xl animate-in scale-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#12100E] text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#B39274] font-bold block mb-0.5">
                  Taxonomy &amp; Display Showcase
                </span>
                <h3 className="text-lg font-bold text-white">
                  {editingBrand ? "Edit Brand & Foto Display" : "Tambah Brand & Upload Foto Display"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#B3A69C] hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                id="btn-close-brand-modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-6 space-y-5">
              {validationError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}

              {/* Brand Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                  Nama Brand Mewah (Brand Name) *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Chanel, Prada, Dior, Hermes, Gucci"
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-semibold"
                  required
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2 pt-2 border-t border-[#EAE6DF]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Foto Brand untuk Display Landing Page
                  </label>
                  
                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-lg border border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                        uploadMode === "file" ? "bg-[#12100E] text-white shadow-xs" : "text-[#7C634F] hover:text-[#1E1916]"
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                        uploadMode === "url" ? "bg-[#12100E] text-white shadow-xs" : "text-[#7C634F] hover:text-[#1E1916]"
                      }`}
                    >
                      URL Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("presets")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                        uploadMode === "presets" ? "bg-[#12100E] text-white shadow-xs" : "text-[#7C634F] hover:text-[#1E1916]"
                      }`}
                    >
                      Preset
                    </button>
                  </div>
                </div>

                {/* File Upload Mode */}
                {uploadMode === "file" && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? "border-[#B39274] bg-[#FAF9F6]" 
                        : "border-[#EAE6DF] hover:border-[#B39274] bg-[#FAF9F6]/50 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#B39274] shadow-xs">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E1916]">
                          Klik untuk pilih foto atau drag &amp; drop ke sini
                        </p>
                        <p className="text-[10px] text-[#7C634F]">
                          Format didukung: PNG, JPG, WEBP (Rekomendasi rasio 4:5 atau 16:9)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* URL Input Mode */}
                {uploadMode === "url" && (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B3A69C]">
                        <LinkIcon size={14} />
                      </div>
                      <input
                        type="url"
                        value={brandImage}
                        onChange={(e) => setBrandImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-[#7C634F]">
                      Masukkan tautan URL gambar online langsung dari CDN atau Unsplash.
                    </p>
                  </div>
                )}

                {/* Presets Gallery Mode */}
                {uploadMode === "presets" && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#7C634F]">Pilih foto koleksi mewah siap pakai:</p>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 bg-[#FAF9F6] rounded-xl border border-[#EAE6DF]">
                      {PRESET_BRAND_IMAGES.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setBrandImage(preset.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                            brandImage === preset.url ? "ring-2 ring-[#B39274] border-transparent" : "border-[#EAE6DF] hover:opacity-80"
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold p-0.5 text-center truncate">
                            {preset.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Live Preview */}
                {brandImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#EAE6DF] bg-neutral-900 aspect-video shadow-xs mt-3 group">
                    <img
                      src={brandImage}
                      alt="Preview Brand Display"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-[#B39274] font-bold block">
                            Preview Display Landing Page
                          </span>
                          <span className="text-sm font-bold text-white">
                            {brandName || "Nama Brand"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBrandImage("")}
                          className="p-1.5 bg-neutral-800/80 hover:bg-neutral-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <X size={12} />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl text-[11px] text-[#7C634F] flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#B39274] shrink-0" />
                    <span>Jika dikosongkan, sistem akan otomatis menggunakan foto display bawaan untuk brand ini.</span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-[#EAE6DF] flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-[#EAE6DF] hover:bg-[#FAF9F6] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#12100E] text-white text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-[#B39274] hover:text-[#1E1916] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  id="btn-save-brand-modal"
                >
                  <Check size={14} />
                  <span>Simpan Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full border border-[#EAE6DF] p-6 space-y-5 shadow-2xl animate-in scale-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="bg-[#FAF9F6] text-[#7C634F] border border-[#EAE6DF] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={22} />
              </div>
              <h4 className="text-lg font-bold text-[#1E1916]">Hapus Brand?</h4>
              <p className="text-xs text-[#7C634F] font-normal">
                Pastikan brand ini tidak memiliki produk aktif sebelum dihapus.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingBrandId(null);
                }}
                className="flex-1 py-2.5 border border-[#EAE6DF] hover:bg-[#FAF9F6] text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
                id="btn-confirm-delete-brand"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
