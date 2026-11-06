import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import { Search, SlidersHorizontal, Check, ShoppingCart, Info, Eye, Heart } from "lucide-react";
import { Produk } from "../types";

export default function KatalogProduk() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBrand = searchParams.get("brand") || "all";
  const wishlistParam = searchParams.get("wishlist") === "true";
  const { products, brands, addToCart, wishlist, toggleWishlist } = useApp();

  // State filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(initialBrand);
  const [showWishlistOnly, setShowWishlistOnly] = useState(wishlistParam);
  const [priceFilter, setPriceFilter] = useState("all"); // 'all', 'under-5m', '5m-30m', 'over-30m'
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'price-asc', 'price-desc'
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Sync showWishlistOnly and brand selection when URL changes
  useEffect(() => {
    setShowWishlistOnly(searchParams.get("wishlist") === "true");
    const bParam = searchParams.get("brand");
    if (bParam) {
      setSelectedBrandId(bParam);
    }
  }, [searchParams]);

  // Format IDR Currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  // Toast feedback timer
  const triggerToast = (message: string) => {
    setAddedMessage(message);
    setTimeout(() => {
      setAddedMessage(null);
    }, 2000);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Produk) => {
    e.stopPropagation(); // prevent navigating to detail
    if (product.stok <= 0) {
      triggerToast(`Stok ${product.namaProduk} saat ini sedang habis.`);
      return;
    }
    addToCart(product, 1);
    triggerToast(`1x ${product.namaProduk} berhasil dimasukkan ke keranjang!`);
  };

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Wishlist Only filter
    if (showWishlistOnly) {
      result = result.filter((p) => wishlist.includes(p.id));
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.namaProduk.toLowerCase().includes(query) ||
          p.SKU.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrandId !== "all") {
      result = result.filter((p) => p.brandId === selectedBrandId);
    }

    // Price tier filter
    if (priceFilter !== "all") {
      if (priceFilter === "under-5m") {
        result = result.filter((p) => p.hargaSatuan < 5000000);
      } else if (priceFilter === "5m-30m") {
        result = result.filter((p) => p.hargaSatuan >= 5000000 && p.hargaSatuan <= 30000000);
      } else if (priceFilter === "over-30m") {
        result = result.filter((p) => p.hargaSatuan > 30000000);
      }
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.hargaSatuan - b.hargaSatuan);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.hargaSatuan - a.hargaSatuan);
    } else {
      // Default: latest/newest first by sorting id in reverse
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [products, searchQuery, selectedBrandId, priceFilter, sortBy]);

  return (
    <ResellerLayout pageTitle="Katalog Reseller">
      {/* Toast Feedback */}
      {addedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1916] text-[#FAF9F6] border border-[#B39274] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{addedMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Exclusive Catalog</span>
            <h1 className="text-3xl font-bold tracking-tight text-[#1E1916]">Katalog Reseller</h1>
            <p className="text-xs text-[#7C634F] font-normal">
              Pilih produk dan masukkan kuantitas untuk checkout digital yang cepat (Bisa pesan mulai 1 unit).
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B39274]">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tas atau SKU..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] rounded-lg transition-all"
              id="catalog-search-input"
            />
          </div>
        </div>
      </section>

      {/* FILTER & SORT PANEL */}
      <section className="border-b border-[#EAE6DF] bg-[#FAF9F6] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#7C634F] font-semibold">
              <SlidersHorizontal size={14} />
              <span>Saring:</span>
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-white border border-[#EAE6DF] px-3 py-1.5 text-xs text-[#1E1916] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39274] cursor-pointer"
              id="filter-brand"
            >
              <option value="all">Semua Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.namaBrand}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-white border border-[#EAE6DF] px-3 py-1.5 text-xs text-[#1E1916] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39274] cursor-pointer"
              id="filter-price"
            >
              <option value="all">Semua Harga</option>
              <option value="under-5m">Di bawah Rp 5 Juta</option>
              <option value="5m-30m">Rp 5 Juta - Rp 30 Juta</option>
              <option value="over-30m">Di atas Rp 30 Juta</option>
            </select>

            {/* Wishlist filter badge */}
            <button
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                showWishlistOnly
                  ? "bg-[#1E1916] text-[#FAF9F6] border-[#1E1916]"
                  : "bg-white text-gray-600 border-[#EAE6DF] hover:bg-gray-50"
              }`}
            >
              <Heart size={13} className={showWishlistOnly ? "fill-[#B39274] text-[#B39274]" : "text-gray-400"} />
              <span>Hanya Favorit ({wishlist.length})</span>
            </button>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#7C634F] font-semibold whitespace-nowrap">Urutkan:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#EAE6DF] px-3 py-1.5 text-xs text-[#1E1916] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B39274] cursor-pointer"
              id="sort-products"
            >
              <option value="latest">Terbaru</option>
              <option value="price-asc">Harga: Terendah ke Tertinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Terendah</option>
            </select>
          </div>
        </div>
      </section>

      {/* CATALOG GRID */}
      <section className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#EAE6DF] rounded-2xl space-y-4">
              <div className="bg-[#FAF9F6] w-14 h-14 rounded-full flex items-center justify-center mx-auto text-[#B39274]">
                <Info size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1916]">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-[#7C634F] max-w-sm mx-auto font-normal leading-relaxed">
                Kata kunci atau saringan filter Anda tidak cocok dengan koleksi produk tas kami saat ini. Silakan atur kembali kata pencarian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const brand = brands.find((b) => b.id === product.brandId);
                const isOutOfStock = product.stok <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden hover:shadow-lg hover:border-[#B39274] transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Image Area with luxury aspect ratio */}
                    <div className="aspect-[4/3] bg-[#FAF9F6] relative overflow-hidden border-b border-[#FAF9F6]">
                      <img
                        src={product.gambar}
                        alt={product.namaProduk}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Brand Label */}
                      <span className="absolute top-3 left-3 bg-[#1E1916] text-[#FAF9F6] text-[9px] tracking-widest uppercase px-2.5 py-1 font-semibold rounded-sm">
                        {brand ? brand.namaBrand : "Premium Brand"}
                      </span>

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white p-2 rounded-full shadow-md text-[#1E1916] hover:scale-115 transition-transform"
                        title={wishlist.includes(product.id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                      >
                        <Heart
                          size={14}
                          className={wishlist.includes(product.id) ? "fill-[#B39274] text-[#B39274]" : "text-gray-400"}
                        />
                      </button>

                      {/* Stock overlay if running low or out */}
                      {product.stok <= 0 ? (
                        <div className="absolute inset-0 bg-[#1E1916]/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <span className="text-xs text-amber-200 font-bold tracking-widest uppercase border border-amber-200/50 px-3 py-1.5 bg-black/40">
                            Stok Habis
                          </span>
                        </div>
                      ) : product.stok <= 3 ? (
                        <span className="absolute bottom-3 right-3 bg-[#1E1916] text-[#B39274] border border-[#B39274]/50 text-[9px] uppercase px-2.5 py-1 font-bold rounded shadow-sm z-10">
                          Sisa {product.stok} unit
                        </span>
                      ) : null}

                      {/* Hover eye button */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-[#1E1916] p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <Eye size={18} />
                        </span>
                      </div>
                    </div>

                    {/* Content info area */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] tracking-wider uppercase text-[#B39274] font-semibold font-mono block">
                          SKU: {product.SKU}
                        </span>
                        <h3 className="text-sm font-bold text-[#1E1916] tracking-tight group-hover:text-[#B39274] transition-colors line-clamp-1">
                          {product.namaProduk}
                        </h3>
                        <p className="text-[#1E1916] text-sm font-extrabold pt-1">
                          {formatIDR(product.hargaSatuan)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* More detail trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                          className="flex-1 border border-[#EAE6DF] hover:border-[#1E1916] text-[#1E1916] text-[11px] tracking-wider uppercase py-2.5 font-semibold transition-colors duration-200 rounded-lg"
                        >
                          Detail
                        </button>

                        {/* Add to cart trigger */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isOutOfStock}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-white text-[11px] tracking-wider uppercase py-2.5 font-semibold rounded-lg transition-colors duration-200 ${
                            isOutOfStock
                              ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                              : "bg-[#1E1916] hover:bg-[#B39274]"
                          }`}
                        >
                          <ShoppingCart size={13} />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ResellerLayout>
  );
}
