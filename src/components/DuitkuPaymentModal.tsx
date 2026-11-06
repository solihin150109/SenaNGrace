import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Copy, 
  Check, 
  CreditCard, 
  QrCode, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight
} from "lucide-react";

interface DuitkuPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  { code: "QR", name: "QRIS Instant", desc: "GoPay, OVO, Dana, ShopeePay, BCA", icon: QrCode, badge: "Instan" },
  { code: "BC", name: "BCA Virtual Account", desc: "Verifikasi otomatis 24 Jam", icon: Building2, bank: "BCA" },
  { code: "M2", name: "Mandiri Virtual Account", desc: "Livin' by Mandiri & ATM", icon: Building2, bank: "Mandiri" },
  { code: "BR", name: "BRI Virtual Account", desc: "BRImo & ATM Bank BRI", icon: Building2, bank: "BRI" },
  { code: "BN", name: "BNI Virtual Account", desc: "BNI Mobile & ATM", icon: Building2, bank: "BNI" },
  { code: "BT", name: "Permata Virtual Account", desc: "PermataMobile X & ATM", icon: Building2, bank: "Permata" },
];

export default function DuitkuPaymentModal({ order, isOpen, onClose, onSuccess }: DuitkuPaymentModalProps) {
  const { createDuitkuInvoice, simulateDuitkuPay, checkDuitkuPaymentStatus } = useApp();

  const [selectedMethod, setSelectedMethod] = useState("QR");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    reference: string;
    vaNumber: string;
    paymentUrl: string;
    qrString: string;
  } | null>(null);
  
  const [verifying, setVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(order.status === "Dibayar" || order.status === "Diproses");
  const [simulating, setSimulating] = useState(false);

  // Initialize or fetch Duitku invoice when opened or payment method changed
  useEffect(() => {
    if (!isOpen) return;

    // If order already has Duitku data and matching method
    if (order.duitkuReference && order.duitkuPaymentMethod === selectedMethod) {
      setInvoiceData({
        reference: order.duitkuReference,
        vaNumber: order.duitkuVaNumber || "8920192819",
        paymentUrl: order.duitkuPaymentUrl || "",
        qrString: order.duitkuQrString || ""
      });
      return;
    }

    const initInvoice = async () => {
      setLoading(true);
      const res = await createDuitkuInvoice(order.id, selectedMethod);
      setLoading(false);
      if (res.success && res.reference) {
        setInvoiceData({
          reference: res.reference,
          vaNumber: res.vaNumber || "8920192819",
          paymentUrl: res.paymentUrl || "",
          qrString: res.qrString || ""
        });
      }
    };

    initInvoice();
  }, [isOpen, selectedMethod, order.id]);

  // Polling to auto-detect payment status change
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const interval = setInterval(async () => {
      const statusRes = await checkDuitkuPaymentStatus(order.id);
      if (statusRes.isPaid) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess, order.id, checkDuitkuPaymentStatus, onSuccess]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      const res = await simulateDuitkuPay(order.id);
      setSimulating(false);
      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch {
      setSimulating(false);
    }
  };

  const handleManualCheckStatus = async () => {
    setVerifying(true);
    const res = await checkDuitkuPaymentStatus(order.id);
    setVerifying(false);
    if (res.isPaid) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl overflow-hidden max-w-xl w-full max-h-[92vh] flex flex-col border border-[#EAE6DF] shadow-2xl animate-in scale-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-[#1E1916] text-[#FAF9F6] px-6 py-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B39274]/20 border border-[#B39274]/40 flex items-center justify-center text-[#B39274]">
              <Lock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">Duitku Payment Gateway</span>
                <span className="text-[9px] bg-[#B39274] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>Terlisensi Bank Indonesia • Enkripsi 256-bit</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ORDER AMOUNT STRIP */}
        <div className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C634F]">Total Tagihan Pembayaran</span>
            <p className="text-xl font-extrabold text-[#1E1916]">{formatIDR(order.totalTagihan)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-[#7C634F]">No. Pesanan</span>
            <p className="text-xs font-mono font-bold text-[#1E1916]">{order.id}</p>
          </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1E1916]">Pembayaran Sukses Terverifikasi!</h3>
                <p className="text-xs text-[#7C634F] max-w-sm mx-auto">
                  Duitku Payment Gateway telah memvalidasi pelunasan untuk pesanan <strong>{order.id}</strong>. Status otomatis diperbarui ke &apos;Dibayar&apos;.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#1E1916] text-white text-xs uppercase tracking-wider font-bold px-8 py-3 rounded-xl hover:bg-[#B39274] transition-colors"
                >
                  Tutup &amp; Lihat Pesanan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* PAYMENT METHOD SELECTOR */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E1916] block">
                  Pilih Kanal Pembayaran Duitku
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = selectedMethod === m.code;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => setSelectedMethod(m.code)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected 
                            ? "border-[#B39274] bg-[#B39274]/10 shadow-xs ring-1 ring-[#B39274]" 
                            : "border-[#EAE6DF] bg-white hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <Icon size={16} className={isSelected ? "text-[#B39274]" : "text-neutral-500"} />
                          {m.badge && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isSelected ? "text-[#1E1916]" : "text-neutral-800"}`}>
                            {m.name}
                          </p>
                          <p className="text-[9px] text-[#7C634F] truncate mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE CHANNEL DISPLAY */}
              {loading ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw size={24} className="animate-spin text-[#B39274] mx-auto" />
                  <p className="text-xs text-[#7C634F]">Menghubungkan ke Duitku Gateway Server...</p>
                </div>
              ) : selectedMethod === "QR" ? (
                /* QRIS DISPLAY */
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] rounded-2xl p-5 text-center space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3 text-xs">
                    <span className="font-bold text-[#1E1916] flex items-center gap-1.5">
                      <QrCode size={16} className="text-[#B39274]" />
                      QRIS Nasional Standar BI
                    </span>
                    <span className="text-[10px] text-[#7C634F] font-mono">Batas: 24 Jam</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#EAE6DF] inline-block shadow-xs">
                    {/* Simulated / Real QRIS Code Display */}
                    <div className="relative w-48 h-48 mx-auto bg-white flex flex-col items-center justify-center border-2 border-dashed border-[#B39274]/50 rounded-lg p-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(invoiceData?.qrString || order.id)}`}
                        alt="Duitku QRIS Code"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 px-2 py-0.5 rounded shadow-xs border border-gray-200">
                          <span className="text-[9px] font-black tracking-widest text-[#1E1916]">QRIS</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#7C634F] font-medium mt-2">
                      Scan via GoPay, OVO, Dana, ShopeePay, atau BCA Mobile
                    </p>
                  </div>

                  <div className="text-[11px] text-[#7C634F] bg-white p-3 rounded-xl border border-[#EAE6DF] text-left space-y-1">
                    <p className="font-semibold text-[#1E1916]">Petunjuk Pembayaran QRIS:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-[#7C634F]">
                      <li>Buka aplikasi e-Wallet atau m-Banking pilihan Anda.</li>
                      <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                      <li>Arahkan kamera ke QR Code di atas.</li>
                      <li>Periksa nama penerima <strong>PT SENNA &amp; GRACE LUXURY</strong> dan nominal Rp {order.totalTagihan.toLocaleString("id-ID")}.</li>
                      <li>Masukkan PIN Anda untuk menyelesaikan pembayaran.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* VIRTUAL ACCOUNT DISPLAY */
                <div className="bg-[#FAF9F6] border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3 text-xs">
                    <span className="font-bold text-[#1E1916]">
                      Nomor Virtual Account Duitku
                    </span>
                    <span className="text-[10px] bg-[#B39274]/15 text-[#B39274] font-bold px-2 py-0.5 rounded">
                      Verifikasi Otomatis
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#EAE6DF] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#7C634F] uppercase font-bold">Kanal Bank</span>
                      <span className="text-xs font-bold text-[#1E1916]">
                        {PAYMENT_METHODS.find(p => p.code === selectedMethod)?.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7C634F] uppercase font-mono block">No. Virtual Account</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-mono font-extrabold text-[#1E1916] tracking-wider">
                          {invoiceData?.vaNumber || "892019281902"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(invoiceData?.vaNumber || "892019281902")}
                          className="text-xs bg-[#FAF9F6] hover:bg-neutral-100 border border-[#EAE6DF] px-3 py-1.5 rounded-lg font-semibold text-[#1E1916] flex items-center gap-1.5 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check size={13} className="text-green-600" />
                              <span className="text-green-600 text-[11px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span className="text-[11px]">Salin VA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-[#EAE6DF] pt-2 text-[10px] text-[#7C634F] flex justify-between">
                      <span>Nama Akun Tujuan:</span>
                      <strong className="text-[#1E1916]">PT SENNA &amp; GRACE LUXURY</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#7C634F] bg-white p-3 rounded-xl border border-[#EAE6DF] space-y-1">
                    <p className="font-semibold text-[#1E1916]">Cara Bayar via m-Banking:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-[#7C634F]">
                      <li>Buka aplikasi m-Banking Anda, pilih menu <strong>Transfer / Bayar &gt; Virtual Account</strong>.</li>
                      <li>Masukkan Nomor Virtual Account di atas.</li>
                      <li>Pastikan nominal tagihan dan nama merchant sesuai.</li>
                      <li>Konfirmasi pembayaran dengan PIN m-Banking Anda.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* DUITKU REFERENCE INFO */}
              <div className="flex items-center justify-between text-[10px] text-[#7C634F] px-1 font-mono">
                <span>Duitku Ref: {invoiceData?.reference || "Pending"}</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Status: Menunggu Pembayaran
                </span>
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!isSuccess && (
          <div className="p-5 bg-white border-t border-[#EAE6DF] space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* SIMULATION BUTTON (For Testing Gateway) */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={simulating}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Memverifikasi Simulasi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Simulasi Bayar Sekarang (Sandbox)</span>
                  </>
                )}
              </button>

              {/* MANUAL CHECK STATUS */}
              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={verifying}
                className="border border-[#1E1916] text-[#1E1916] hover:bg-[#1E1916] hover:text-white text-xs uppercase tracking-wider font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={13} className={verifying ? "animate-spin" : ""} />
                <span>Cek Status</span>
              </button>
            </div>
            <p className="text-[10px] text-center text-[#7C634F]">
              Didukung oleh <strong>Duitku Payment Gateway Indonesia</strong>. Setelah dana diterima, sistem akan langsung memverifikasi otomatis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
