import React, { useEffect } from "react";
import { Order } from "../types";
import { X, Check, XCircle, ExternalLink, Calendar, Building2, User, FileText, ShieldCheck, Clock } from "lucide-react";

interface ReceiptLightboxModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onVerify?: (approved: boolean) => void;
}

export default function ReceiptLightboxModal({
  order,
  isOpen,
  onClose,
  isAdmin = false,
  onVerify
}: ReceiptLightboxModalProps) {
  // ESC key listener to close modal from anywhere
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order || !order.buktiPembayaran) return null;

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div
      onClick={(e) => {
        // Close if backdrop clicked
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      {/* Floating High-Priority Close Button on top-right viewport for extreme accessibility */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] bg-black/80 hover:bg-black text-white p-2.5 sm:p-3 rounded-full shadow-2xl border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Tutup (ESC)"
        aria-label="Tutup Pratinjau Struk"
        id="btn-floating-close-receipt"
      >
        <X size={20} className="stroke-[2.5]" />
      </button>

      {/* Main Modal Card */}
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden max-w-2xl w-full max-h-[min(92vh,840px)] flex flex-col border border-[#B39274]/40 shadow-2xl animate-in scale-in-95 duration-200 my-auto relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="bg-[#1E1916] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl text-[#B39274] shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <h3 id="receipt-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                Bukti Pembayaran / Transfer
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#B3A69C] font-mono truncate">
                Order ID: {order.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-[#B3A69C] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup Modal (ESC)"
            id="btn-close-receipt-lightbox"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain min-h-0">
          
          {/* Status & Total Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6] p-3.5 sm:p-4 rounded-xl border border-[#EAE6DF]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Status Verifikasi</p>
              <div className="flex items-center gap-2 mt-1">
                {order.statusVerifikasiBukti === "Terverifikasi" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                    <Check size={12} className="stroke-[3]" />
                    <span>Terverifikasi Lunas</span>
                  </span>
                ) : order.statusVerifikasiBukti === "Ditolak" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                    <XCircle size={12} />
                    <span>Bukti Ditolak Admin</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                    <Clock size={12} className="animate-pulse text-amber-600" />
                    <span>Menunggu Verifikasi Admin</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Total Tagihan</p>
              <p className="text-sm sm:text-base font-bold text-[#1E1916] font-mono">{formatIDR(order.totalTagihan)}</p>
            </div>
          </div>

          {/* Dynamic Struk Image Box */}
          <div className="border border-[#EAE6DF] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-950 relative group flex items-center justify-center p-2 min-h-[180px] max-h-[36vh] sm:max-h-[44vh]">
            <img
              src={order.buktiPembayaran}
              alt="Bukti Transfer Struk"
              className="max-h-[34vh] sm:max-h-[42vh] w-auto max-w-full object-contain rounded-lg shadow-inner"
              referrerPolicy="no-referrer"
            />
            <a
              href={order.buktiPembayaran}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all shadow-md backdrop-blur-xs"
              title="Buka gambar resolusi penuh di tab baru"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Buka Gambar Asli</span>
              <span className="sm:hidden">Full</span>
            </a>
          </div>

          {/* Transfer Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF9F6] p-3.5 sm:p-4 rounded-xl border border-[#EAE6DF]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold flex items-center gap-1">
                <Building2 size={12} className="text-[#B39274]" />
                <span>Bank Tujuan</span>
              </span>
              <p className="font-semibold text-[#1E1916]">{order.bankTujuan || "BCA (PT Senna & Grace Luxury)"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold flex items-center gap-1">
                <User size={12} className="text-[#B39274]" />
                <span>Nama Pengirim Transfer</span>
              </span>
              <p className="font-semibold text-[#1E1916]">{order.namaPengirimTransfer || order.namaUser}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold flex items-center gap-1">
                <Calendar size={12} className="text-[#B39274]" />
                <span>Waktu Upload Bukti</span>
              </span>
              <p className="font-semibold text-[#1E1916]">
                {order.waktuUploadBukti 
                  ? new Date(order.waktuUploadBukti).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
                  : new Date(order.tanggal).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold flex items-center gap-1">
                <FileText size={12} className="text-[#B39274]" />
                <span>Catatan Reseller</span>
              </span>
              <p className="text-[#1E1916] italic">{order.catatanPembayaran || "-"}</p>
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#EAE6DF] shrink-0 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-[#EAE6DF] hover:bg-neutral-100 text-[#1E1916] text-xs uppercase font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="btn-footer-close-receipt"
          >
            <X size={14} />
            <span>Tutup Pratinjau</span>
          </button>

          {/* Admin Verification Actions if admin */}
          {isAdmin && onVerify && (
            <div className="flex items-center gap-2.5 flex-1 justify-end">
              <button
                type="button"
                onClick={() => onVerify(false)}
                className="px-3.5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-admin-reject-proof"
              >
                <XCircle size={15} />
                <span>Tolak Bukti</span>
              </button>

              <button
                type="button"
                onClick={() => onVerify(true)}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                id="btn-admin-approve-proof"
              >
                <Check size={15} className="stroke-[3]" />
                <span>Verifikasi Lunas</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
