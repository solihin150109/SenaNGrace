import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import { Clock, CheckCircle2, Truck, CreditCard, ChevronRight, RefreshCw, Upload, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { Order, OrderStatus } from "../types";
import UploadBuktiModal from "../components/UploadBuktiModal";
import ReceiptLightboxModal from "../components/ReceiptLightboxModal";
import DuitkuPaymentModal from "../components/DuitkuPaymentModal";

export default function DaftarPesanan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<"All" | "Menunggu Pembayaran" | "Dibayar" | "Dikirim" | "Selesai">("All");
  
  // Payment & Receipt modal states
  const [showDuitkuModal, setShowDuitkuModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLightboxModal, setShowLightboxModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auto-open Duitku gateway modal if navigated with a specific Order ID from checkout
  useEffect(() => {
    if (location.state && (location.state as any).justOrderedId) {
      const orderId = (location.state as any).justOrderedId;
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder && targetOrder.status === "Menunggu Pembayaran") {
        setSelectedOrder(targetOrder);
        setShowDuitkuModal(true);
      }
    }
  }, [location.state, orders]);

  // Format IDR Currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  // Filter orders for logged-in reseller
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.userId === currentUser.id);
  }, [orders, currentUser]);

  // Filter by tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return userOrders;
    return userOrders.filter(o => o.status === activeTab);
  }, [userOrders, activeTab]);

  const handleOpenDuitku = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowDuitkuModal(true);
  };

  const handleOpenUpload = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowUploadModal(true);
  };

  const handleOpenReceiptView = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowLightboxModal(true);
  };

  const getStatusBadge = (order: Order) => {
    switch (order.status) {
      case "Menunggu Pembayaran":
        if (order.buktiPembayaran && order.statusVerifikasiBukti !== "Diverifikasi (Duitku Gateway)") {
          return (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock size={10} className="text-amber-600 animate-pulse" />
              <span>Bukti Diupload (Menunggu Verifikasi)</span>
            </span>
          );
        }
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} />
            <span>Belum Bayar</span>
          </span>
        );
      case "Dibayar":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-600" />
            <span>{order.duitkuReference ? "Lunas (Duitku Gateway)" : "Lunas Terverifikasi"}</span>
          </span>
        );
      case "Diproses":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin" />
            <span>Sedang QC &amp; Packing</span>
          </span>
        );
      case "Dikirim":
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Truck size={10} />
            <span>Dikirim ({order.jenisPengiriman?.split("-")[0]?.trim() || "Kurir"})</span>
          </span>
        );
      case "Selesai":
        return (
          <span className="bg-green-50 text-green-700 border border-green-100 text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>Selesai</span>
          </span>
        );
    }
  };

  return (
    <ResellerLayout pageTitle="Pesanan Saya">
      
      {/* HEADER SECTION */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Order Ledger</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E1916]">Riwayat Pesanan</h1>
          <p className="text-xs text-[#7C634F] font-normal">
            Pantau status transaksi, bayar faktur, dan lacak nomor resi dropship.
          </p>
        </div>
      </section>

      {/* FILTER STATUS TABS */}
      <section className="border-b border-[#EAE6DF] bg-[#FAF9F6] px-6">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-xs font-semibold uppercase tracking-widest text-[#7C634F] py-3.5">
          <button
            onClick={() => setActiveTab("All")}
            className={`pb-1 border-b-2 whitespace-nowrap ${
              activeTab === "All" ? "border-[#1E1916] text-[#1E1916] font-extrabold" : "border-transparent hover:text-[#1E1916]"
            }`}
            id="tab-all"
          >
            Semua ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("Menunggu Pembayaran")}
            className={`pb-1 border-b-2 whitespace-nowrap ${
              activeTab === "Menunggu Pembayaran" ? "border-[#1E1916] text-[#1E1916] font-extrabold" : "border-transparent hover:text-[#1E1916]"
            }`}
            id="tab-unpaid"
          >
            Belum Bayar ({userOrders.filter(o => o.status === "Menunggu Pembayaran").length})
          </button>
          <button
            onClick={() => setActiveTab("Dibayar")}
            className={`pb-1 border-b-2 whitespace-nowrap ${
              activeTab === "Dibayar" ? "border-[#1E1916] text-[#1E1916] font-extrabold" : "border-transparent hover:text-[#1E1916]"
            }`}
            id="tab-paid"
          >
            Lunas / Diproses ({userOrders.filter(o => o.status === "Dibayar" || o.status === "Diproses").length})
          </button>
          <button
            onClick={() => setActiveTab("Dikirim")}
            className={`pb-1 border-b-2 whitespace-nowrap ${
              activeTab === "Dikirim" ? "border-[#1E1916] text-[#1E1916] font-extrabold" : "border-transparent hover:text-[#1E1916]"
            }`}
            id="tab-shipped"
          >
            Dikirim ({userOrders.filter(o => o.status === "Dikirim").length})
          </button>
          <button
            onClick={() => setActiveTab("Selesai")}
            className={`pb-1 border-b-2 whitespace-nowrap ${
              activeTab === "Selesai" ? "border-[#1E1916] text-[#1E1916] font-extrabold" : "border-transparent hover:text-[#1E1916]"
            }`}
            id="tab-completed"
          >
            Selesai ({userOrders.filter(o => o.status === "Selesai").length})
          </button>
        </div>
      </section>

      {/* ORDERS CARD LIST */}
      <section className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#EAE6DF] rounded-2xl space-y-4">
              <div className="bg-[#FAF9F6] w-14 h-14 rounded-full flex items-center justify-center mx-auto text-[#B39274]">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1E1916]">Tidak Ada Pesanan</h3>
              <p className="text-xs text-[#7C634F] max-w-sm mx-auto font-normal leading-relaxed">
                Belum ada transaksi terdaftar pada kategori ini. Silakan tambahkan barang di katalog dan lakukan proses checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const totalItems = order.details.reduce((acc, d) => acc + d.jumlah, 0);
                const firstDetail = order.details[0];

                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/order-detail/${order.id}`)}
                    className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer grid lg:grid-cols-12 gap-0"
                  >
                    {/* Visual left pane info (col 8) */}
                    <div className="lg:col-span-8 p-6 space-y-4">
                      {/* Order top info bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-[#1E1916]">
                            No. Order: {order.id}
                          </span>
                          <span className="text-xs text-[#7C634F] font-light">
                            {new Date(order.tanggal).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        {getStatusBadge(order)}
                      </div>

                      {/* Order product preview summary */}
                      {firstDetail && (
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#EAE6DF] shrink-0">
                            <img src={firstDetail.gambarProduk} alt={firstDetail.namaProduk} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#1E1916] line-clamp-1">
                              {firstDetail.namaProduk}
                            </p>
                            <p className="text-[11px] text-[#7C634F] font-light">
                              {formatIDR(firstDetail.hargaSatuan)} &times; {firstDetail.jumlah} unit
                            </p>
                            {totalItems > firstDetail.jumlah && (
                              <p className="text-[10px] text-[#B39274] font-semibold mt-1">
                                + {totalItems - firstDetail.jumlah} produk lainnya dalam pesanan ini
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Alamat summary & Payment Proof Indicator */}
                      <div className="space-y-3">
                        <div className="text-[11px] text-[#7C634F] bg-[#FAF9F6] p-3 rounded-xl border border-[#EAE6DF] space-y-1">
                          <p className="font-semibold text-[#1E1916]">Alamat Dropship:</p>
                          <p className="font-light line-clamp-1">
                            {order.alamatPengiriman.alamat}, Kel. {order.alamatPengiriman.kelurahan}, Kec. {order.alamatPengiriman.kecamatan}, {order.alamatPengiriman.kotaKabupaten}, {order.alamatPengiriman.provinsi} {order.alamatPengiriman.kodePos}
                          </p>
                          {order.nomorResi && (
                            <p className="font-bold text-[#1E1916] pt-1">
                              Resi ({order.jenisPengiriman}): <span className="font-mono text-[#B39274]">{order.nomorResi}</span>
                            </p>
                          )}
                        </div>

                        {/* Payment proof thumbnail banner if available */}
                        {order.buktiPembayaran && (
                          <div 
                            onClick={(e) => handleOpenReceiptView(e, order)}
                            className="bg-amber-50/50 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-amber-200 shrink-0">
                                <img src={order.buktiPembayaran} alt="Struk Transfer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                                  <FileText size={12} className="text-amber-700" />
                                  <span>Bukti Transfer Terlampir</span>
                                </p>
                                <p className="text-[10px] text-amber-800">
                                  {order.bankTujuan ? order.bankTujuan.split("-")[0] : "Bank Transfer"} • {order.namaPengirimTransfer || order.namaUser}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleOpenReceiptView(e, order)}
                              className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white border border-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-100/50"
                            >
                              Lihat Struk
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and secondary CTA pane (col 4) */}
                    <div className="lg:col-span-4 bg-[#FAF9F6] border-t lg:border-t-0 lg:border-l border-[#EAE6DF] p-6 flex flex-col justify-between items-stretch">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Total Tagihan</p>
                        <p className="text-lg font-extrabold text-[#1E1916]">
                          {formatIDR(order.totalTagihan)}
                        </p>
                        <p className="text-[9px] text-[#7C634F] font-mono">Sudah termasuk Biaya Layanan</p>
                      </div>

                      <div className="mt-6 flex flex-col gap-2">
                        {order.status === "Menunggu Pembayaran" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleOpenDuitku(e, order)}
                              className="w-full bg-emerald-700 text-white text-xs tracking-wider uppercase font-bold py-2.5 rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              id={`btn-duitku-pay-${order.id}`}
                            >
                              <CreditCard size={13} />
                              <span>Bayar via Duitku</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenUpload(e, order)}
                              className="w-full border border-[#1E1916] text-[#1E1916] text-xs tracking-wider uppercase font-semibold py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors"
                              id={`btn-upload-proof-${order.id}`}
                            >
                              <Upload size={12} />
                              <span>{order.buktiPembayaran ? "Ubah Struk" : "Manual Struk"}</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => navigate(`/order-detail/${order.id}`)}
                          className="w-full border border-[#EAE6DF] bg-white hover:border-[#1E1916] text-[#1E1916] text-xs tracking-wider uppercase font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Lihat Detail</span>
                          <ChevronRight size={13} />
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

      {/* DUITKU PAYMENT GATEWAY MODAL */}
      {selectedOrder && (
        <DuitkuPaymentModal
          order={selectedOrder}
          isOpen={showDuitkuModal}
          onClose={() => {
            setShowDuitkuModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* UPLOAD PAYMENT PROOF MODAL */}
      {selectedOrder && (
        <UploadBuktiModal
          order={selectedOrder}
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* RECEIPT LIGHTBOX MODAL */}
      {selectedOrder && (
        <ReceiptLightboxModal
          order={selectedOrder}
          isOpen={showLightboxModal}
          onClose={() => {
            setShowLightboxModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </ResellerLayout>
  );
}
