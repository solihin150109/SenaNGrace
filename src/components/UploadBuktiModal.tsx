import React, { useState, useRef, useEffect } from "react";
import { Order } from "../types";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Upload, 
  Check, 
  Copy, 
  CreditCard, 
  Building2, 
  QrCode, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";

interface UploadBuktiModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BANK_ACCOUNTS = [
  {
    id: "bca",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "8920192819",
    accountHolder: "PT SENNA & GRACE LUXURY",
    badge: "Utama",
    logoColor: "bg-blue-600"
  },
  {
    id: "mandiri",
    bankName: "Bank Mandiri",
    accountNumber: "1370019281902",
    accountHolder: "PT SENNA & GRACE LUXURY",
    logoColor: "bg-amber-600"
  },
  {
    id: "bri",
    bankName: "Bank BRI",
    accountNumber: "028101002918304",
    accountHolder: "PT SENNA & GRACE LUXURY",
    logoColor: "bg-blue-800"
  },
  {
    id: "bsi",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7192839182",
    accountHolder: "PT SENNA & GRACE LUXURY",
    logoColor: "bg-emerald-600"
  }
];

export default function UploadBuktiModal({ order, isOpen, onClose, onSuccess }: UploadBuktiModalProps) {
  const { uploadPaymentProof, payOrder } = useApp();

  const [activePaymentType, setActivePaymentType] = useState<"transfer" | "qris" | "instant">("transfer");
  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0].bankName + " - " + BANK_ACCOUNTS[0].accountNumber);
  const [namaPengirim, setNamaPengirim] = useState(order.namaPengirimTransfer || order.namaUser || "");
  const [catatan, setCatatan] = useState(order.catatanPembayaran || "");
  
  const [imagePreview, setImagePreview] = useState<string | null>(order.buktiPembayaran || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on ESC and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Mohon upload file gambar (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUseDemoReceipt = () => {
    setErrorMessage("");
    // Realistic transaction receipt screenshot
    const demoUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80";
    setImagePreview(demoUrl);
    if (!namaPengirim) {
      setNamaPengirim("Grace Natalia (Reseller)");
    }
    if (!catatan) {
      setCatatan("Transfer m-Banking order " + order.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!imagePreview) {
      setErrorMessage("Silakan pilih file gambar bukti transfer terlebih dahulu.");
      return;
    }

    if (!namaPengirim.trim()) {
      setErrorMessage("Nama pemilik rekening pengirim wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      uploadPaymentProof(order.id, imagePreview, {
        bankTujuan: selectedBank,
        namaPengirimTransfer: namaPengirim.trim(),
        catatanPembayaran: catatan.trim()
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }, 800);
  };

  const handleInstantPay = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      payOrder(order.id);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }, 1000);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Close Button for extreme accessibility */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] bg-black/80 hover:bg-black text-white p-2.5 sm:p-3 rounded-full shadow-2xl border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Tutup (ESC)"
        aria-label="Tutup Modal"
        id="btn-floating-close-upload"
      >
        <X size={20} className="stroke-[2.5]" />
      </button>

      {/* Main Modal Card */}
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden max-w-xl w-full max-h-[min(92vh,840px)] flex flex-col border border-[#B39274]/40 shadow-2xl animate-in scale-in-95 duration-200 my-auto relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="bg-[#1E1916] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[#B39274] text-[10px] tracking-widest uppercase font-bold mb-0.5">
              <ShieldCheck size={13} />
              <span>Verifikasi Pembayaran Resmi</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
              Upload Bukti Pembayaran
            </h3>
            <p className="text-[11px] text-[#B3A69C] font-mono truncate">
              Nomor Order: <span className="text-white font-bold">{order.id}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-[#B3A69C] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup Modal (ESC)"
            id="btn-close-upload-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Invoice Summary Pill */}
        <div className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-5 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">Total Tagihan</span>
            <span className="text-base sm:text-lg font-bold text-[#1E1916] font-mono">{formatIDR(order.totalTagihan)}</span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(order.totalTagihan.toString(), "total")}
            className="inline-flex items-center gap-1.5 text-xs bg-white hover:bg-[#FAF9F6] border border-[#EAE6DF] text-[#1E1916] px-3 py-1.5 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer"
          >
            {copiedKey === "total" ? (
              <>
                <Check size={13} className="text-green-600" />
                <span className="text-green-600 text-[11px]">Tersalin</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-[#7C634F]" />
                <span className="text-[11px]">Salin Nominal</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs: Transfer Manual vs QRIS vs Sandbox */}
        <div className="flex border-b border-[#EAE6DF] bg-[#FAF9F6] px-5 sm:px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActivePaymentType("transfer")}
            className={`pb-2.5 px-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activePaymentType === "transfer"
                ? "border-[#1E1916] text-[#1E1916]"
                : "border-transparent text-[#7C634F] hover:text-[#1E1916]"
            }`}
          >
            <Building2 size={13} />
            <span>Transfer Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePaymentType("qris")}
            className={`pb-2.5 px-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activePaymentType === "qris"
                ? "border-[#1E1916] text-[#1E1916]"
                : "border-transparent text-[#7C634F] hover:text-[#1E1916]"
            }`}
          >
            <QrCode size={13} />
            <span>QRIS</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePaymentType("instant")}
            className={`pb-2.5 px-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activePaymentType === "instant"
                ? "border-[#1E1916] text-[#1E1916]"
                : "border-transparent text-[#7C634F] hover:text-[#1E1916]"
            }`}
          >
            <Sparkles size={13} />
            <span>Simulasi Cepat</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain min-h-0">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check size={28} className="stroke-[3]" />
              </div>
              <h4 className="text-lg font-bold text-[#1E1916]">
                {activePaymentType === "instant" ? "Pembayaran Berhasil!" : "Bukti Pembayaran Terkirim!"}
              </h4>
              <p className="text-xs text-[#7C634F] max-w-sm mx-auto font-light leading-relaxed">
                {activePaymentType === "instant" 
                  ? "Status pesanan telah otomatis diperbarui menjadi Diproses." 
                  : "Admin Senna & Grace akan segera memverifikasi mutasi rekening Anda dan memproses pesanan."}
              </p>
            </div>
          ) : activePaymentType === "instant" ? (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200/70 p-4 rounded-xl text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-700" />
                  Mode Simulasi Cepat (Direct Auto-Approval)
                </p>
                <p className="font-light text-[11px] leading-relaxed text-amber-800">
                  Fitur ini disediakan untuk pengujian alur dropship instan tanpa perlu menunggu proses verifikasi manual mutasi bank oleh admin.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleInstantPay}
                className="w-full py-3 bg-[#1E1916] hover:bg-[#B39274] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-instant-pay-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Simulasi...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Simulasikan Pembayaran Lunas Sekarang</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* QRIS or Bank Accounts */}
              {activePaymentType === "qris" ? (
                <div className="text-center space-y-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF]">
                  <p className="text-xs font-bold text-[#1E1916]">Scan QRIS Resmi Senna &amp; Grace</p>
                  <p className="text-[11px] text-[#7C634F]">Mendukung GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin Mandiri, BRImo, dll.</p>
                  
                  <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-xl border border-[#EAE6DF] shadow-xs flex items-center justify-center">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SENNA-GRACE-PAYMENT-ORDER-REF" 
                      alt="QRIS Senna Grace" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#7C634F] block">NMID: ID1029182910291 • PT SENNA &amp; GRACE</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Pilih Rekening Tujuan Transfer
                  </label>
                  
                  <div className="space-y-2">
                    {BANK_ACCOUNTS.map((bank) => {
                      const isSelected = selectedBank.startsWith(bank.bankName);
                      return (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedBank(`${bank.bankName} - ${bank.accountNumber}`)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-[#1E1916] bg-[#FAF9F6] ring-1 ring-[#1E1916]"
                              : "border-[#EAE6DF] bg-white hover:border-[#B39274]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg ${bank.logoColor} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                              {bank.id.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-[#1E1916]">{bank.bankName}</p>
                                {bank.badge && (
                                  <span className="bg-[#B39274]/15 text-[#B39274] text-[8px] uppercase font-extrabold px-1.5 py-0.2 rounded">
                                    {bank.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono font-bold text-[#1E1916]">{bank.accountNumber}</p>
                              <p className="text-[9px] text-[#7C634F]">a/n {bank.accountHolder}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(bank.accountNumber, bank.id);
                            }}
                            className="p-1.5 text-[#7C634F] hover:text-[#1E1916] hover:bg-white rounded-lg border border-[#EAE6DF] transition-colors cursor-pointer"
                            title="Salin Nomor Rekening"
                          >
                            {copiedKey === bank.id ? (
                              <Check size={13} className="text-green-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Dropzone / File Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Unggah Bukti Struk / Tangkapan Layar
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleUseDemoReceipt}
                    className="text-[10px] text-[#B39274] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                    id="btn-use-demo-receipt"
                  >
                    <Sparkles size={11} />
                    <span>Contoh Struk</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  id="input-payment-receipt-file"
                />

                {imagePreview ? (
                  <div className="relative border border-[#1E1916] rounded-xl bg-[#FAF9F6] p-3 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[#EAE6DF]">
                      <img 
                        src={imagePreview} 
                        alt="Bukti Transfer" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-[#1E1916] flex items-center gap-1">
                        <Check size={13} className="text-green-600" />
                        <span>File Siap Dikirim</span>
                      </p>
                      <p className="text-[10px] text-[#7C634F] mt-0.5 truncate font-mono">
                        Struk Transfer
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] uppercase tracking-wider font-bold text-[#1E1916] bg-white border border-[#EAE6DF] px-2.5 py-1 rounded-md hover:bg-neutral-50 cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="text-[10px] uppercase tracking-wider font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={11} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EAE6DF] hover:border-[#B39274] bg-[#FAF9F6] rounded-xl p-5 text-center cursor-pointer transition-all space-y-1.5"
                    id="dropzone-receipt"
                  >
                    <div className="w-10 h-10 bg-white text-[#B39274] rounded-full flex items-center justify-center mx-auto shadow-2xs border border-[#EAE6DF]">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1E1916]">
                        Klik atau Tarik Foto Bukti Transfer ke Sini
                      </p>
                      <p className="text-[10px] text-[#7C634F]">
                        Format PNG, JPG, atau WEBP (Maksimal 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Nama Pemilik Rekening Pengirim *
                  </label>
                  <input
                    type="text"
                    value={namaPengirim}
                    onChange={(e) => setNamaPengirim(e.target.value)}
                    placeholder="Contoh: Grace Natalia"
                    required
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E1916]"
                    id="input-sender-name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                    Catatan / Keterangan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Transfer m-BCA jam 14:20"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E1916]"
                    id="input-payment-notes"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#1E1916] hover:bg-[#B39274] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                  id="btn-submit-payment-proof"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim Bukti Transfer...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      <span>Kirim Bukti Pembayaran</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#7C634F] mt-2">
                  Admin akan memverifikasi mutasi rekening dan memproses pesanan dropship Anda.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
