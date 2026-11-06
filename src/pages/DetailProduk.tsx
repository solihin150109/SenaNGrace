import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import { ArrowLeft, ShoppingCart, Heart, Shield, Clock, Weight, Check, Info } from "lucide-react";

export default function DetailProduk() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, brands, addToCart, wishlist, toggleWishlist } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Find target product
  const product = useMemo(() => {
    return products.find((p) => p.id === id);
  }, [products, id]);

  // Brand Info
  const brand = useMemo(() => {
    if (!product) return null;
    return brands.find((b) => b.id === product.brandId);
  }, [brands, product]);

  const isStarred = useMemo(() => {
    if (!product) return false;
    return wishlist.includes(product.id);
  }, [wishlist, product]);

  if (!product) {
    return (
      <ResellerLayout pageTitle="Produk Tidak Ditemukan">
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="text-center bg-white p-12 border border-[#EAE6DF] rounded-2xl max-w-md space-y-4 shadow-sm">
            <div className="bg-amber-50 text-amber-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Info size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1E1916]">Produk Tidak Tersedia</h3>
            <p className="text-xs text-[#7C634F] font-normal">
              Produk dengan kode ID tersebut tidak terdaftar atau sudah dihapus oleh tim admin kami.
            </p>
            <button
              onClick={() => navigate("/catalog")}
              className="px-6 py-2 bg-[#1E1916] text-white text-xs tracking-wider uppercase rounded-lg hover:bg-[#B39274]"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </ResellerLayout>
    );
  }

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stok));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCartSubmit = () => {
    if (product.stok < 1) return;
    addToCart(product, quantity);
    setSuccessToast(`${quantity}x ${product.namaProduk} berhasil masuk ke keranjang belanja!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <ResellerLayout pageTitle={product.namaProduk}>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1916] text-[#FAF9F6] border border-[#B39274] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* BACK BUTTON ROW */}
      <div className="px-6 py-4 border-b border-[#EAE6DF] bg-white flex items-center">
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7C634F] hover:text-[#1E1916] font-semibold transition-colors duration-200"
          id="btn-back-to-catalog"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Katalog</span>
        </button>
      </div>

      {/* DETAIL AREA */}
      <section className="flex-grow p-6 lg:p-10">
        <div className="max-w-6xl mx-auto bg-white border border-[#EAE6DF] rounded-3xl overflow-hidden shadow-sm grid md:grid-cols-12 gap-0">
          
          {/* LEFT COLUMN: LARGE PRODUCT IMAGE */}
          <div className="md:col-span-6 bg-[#FAF9F6] p-6 lg:p-10 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#EAE6DF]">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#EAE6DF] shadow-xs">
              <img
                src={product.gambar}
                alt={product.namaProduk}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 bg-[#1E1916] text-[#FAF9F6] text-xs tracking-[0.2em] uppercase px-3 py-1.5 font-semibold rounded shadow-sm">
                {brand ? brand.namaBrand : "Authentic Luxury"}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER FORM & METADATA */}
          <div className="md:col-span-6 p-6 lg:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Product SKU and Category */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-widest uppercase text-[#B39274] font-bold">
                  SKU: {product.SKU}
                </span>
                {/* Out of stock pill */}
                {product.stok <= 0 ? (
                  <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded">
                    Stok Habis
                  </span>
                ) : (
                  <span className="bg-[#FAF9F6] text-[#7C634F] border border-[#EAE6DF] text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded">
                    Ready Stock ({product.stok} unit)
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-3xl font-bold tracking-tight text-[#1E1916] leading-tight">
                {product.namaProduk}
              </h1>

              {/* Price Tag */}
              <div className="py-3 border-y border-[#EAE6DF] flex justify-between items-center bg-[#FAF9F6] px-4 rounded-xl">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Harga Reseller (Per Unit)</p>
                  <p className="text-xl font-extrabold text-[#1E1916] mt-0.5">
                    {formatIDR(product.hargaSatuan)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Min. Pembelian</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">1 unit (Bisa Ecer)</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#7C634F] font-bold">Deskripsi Produk</p>
                <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                  {product.deskripsi}
                </p>
              </div>

              {/* Spec Badges: Weight, Shipping, Warranty */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3 rounded-xl text-center space-y-1">
                  <div className="text-[#B39274] flex justify-center"><Shield size={16} /></div>
                  <p className="text-[9px] uppercase text-[#7C634F] font-semibold">Garansi</p>
                  <p className="text-[10px] text-[#1E1916] font-bold truncate" title={product.garansi}>{product.garansi}</p>
                </div>
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3 rounded-xl text-center space-y-1">
                  <div className="text-[#B39274] flex justify-center"><Weight size={16} /></div>
                  <p className="text-[9px] uppercase text-[#7C634F] font-semibold">Berat</p>
                  <p className="text-[10px] text-[#1E1916] font-bold truncate">{product.berat} gram</p>
                </div>
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3 rounded-xl text-center space-y-1">
                  <div className="text-[#B39274] flex justify-center"><Clock size={16} /></div>
                  <p className="text-[9px] uppercase text-[#7C634F] font-semibold">Estimasi</p>
                  <p className="text-[10px] text-[#1E1916] font-bold truncate" title={product.estimasiPengiriman}>{product.estimasiPengiriman}</p>
                </div>
              </div>
            </div>

            {/* ORDERING INPUT & ACTIONS */}
            <div className="space-y-4 pt-6 border-t border-[#EAE6DF]">
              {product.stok > 0 ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Counter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold block">Kuantitas</label>
                      <span className="text-[9px] text-emerald-700 font-bold">Min. 1</span>
                    </div>
                    <div className="flex items-center border border-[#EAE6DF] rounded-lg overflow-hidden bg-[#FAF9F6] h-11">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="px-3.5 py-2 text-[#1E1916] hover:bg-[#EAE6DF] transition-colors disabled:opacity-40"
                        id="qty-decrement"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xs font-bold text-[#1E1916]">{quantity}</span>
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= product.stok}
                        className="px-3.5 py-2 text-[#1E1916] hover:bg-[#EAE6DF] transition-colors disabled:opacity-40"
                        id="qty-increment"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart and wishlist */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddToCartSubmit}
                        className="flex-1 h-11 bg-[#1E1916] text-white text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 rounded-lg hover:bg-[#B39274] hover:text-[#1E1916] transition-all"
                        id="btn-add-to-cart-detail"
                      >
                        <ShoppingCart size={15} />
                        <span>Masukkan Keranjang</span>
                      </button>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-11 h-11 border rounded-lg flex items-center justify-center transition-all ${
                          isStarred
                            ? "bg-[#FAF9F6] border-[#B39274] text-[#B39274]"
                            : "border-[#EAE6DF] text-[#7C634F] hover:border-[#1E1916] hover:text-[#1E1916]"
                        }`}
                        title="Simpan ke Wishlist"
                        id="btn-wishlist-toggle"
                      >
                        <Heart size={18} fill={isStarred ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-4 rounded-xl text-center">
                  <p className="text-xs text-[#7C634F] font-medium">
                    Mohon maaf, stok produk ini saat ini sedang habis ({product.stok} unit).
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </ResellerLayout>
  );
}
