import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ShoppingBag,
  ListOrdered,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShoppingCart,
  Heart,
  ChevronDown,
  Settings,
  Store,
  Phone,
  CreditCard,
  MapPin,
  Check,
  Save,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface ResellerLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function ResellerLayout({ children, pageTitle }: ResellerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, cart, wishlist, updateUserProfile } = useApp();
  
  // Collapsible sidebar state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("reseller_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Form States
  const [nama, setNama] = useState("");
  const [namaTokoReseller, setNamaTokoReseller] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [rekeningBank, setRekeningBank] = useState("");
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("reseller_sidebar_collapsed", JSON.stringify(isCollapsed));
    } catch (e) {
      console.error(e);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (currentUser) {
      setNama(currentUser.nama || "");
      setNamaTokoReseller(currentUser.namaTokoReseller || "");
      setNoTelepon(currentUser.noTelepon || "");
      setRekeningBank(currentUser.rekeningBank || "");
      setAlamatLengkap(currentUser.alamatLengkap || "");
    }
  }, [currentUser, profileModalOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateUserProfile({
      nama,
      namaTokoReseller,
      noTelepon,
      rekeningBank,
      alamatLengkap
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setProfileModalOpen(false);
    }, 1200);
  };

  // Check active routes
  const isCatalog = location.pathname === "/catalog" || location.pathname.startsWith("/product/");
  const isOrders = location.pathname === "/orders" || location.pathname.startsWith("/order-detail/");
  const isCart = location.pathname === "/cart";
  const isLevel = location.pathname === "/level";
  const isKemitraan = location.pathname === "/kemitraan";

  const totalCartProducts = cart.length;

  const navItems = [
    {
      name: "Katalog Produk",
      path: "/catalog",
      icon: ShoppingBag,
      active: isCatalog
    },
    {
      name: "Pesanan Saya",
      path: "/orders",
      icon: ListOrdered,
      active: isOrders
    },
    {
      name: "Level Kemitraan",
      path: "/level",
      icon: Award,
      active: isLevel
    }
  ];

  const getInitials = (name: string) => {
    if (!name) return "R";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col selection:bg-[#B39274] selection:text-white relative">
      
      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#1E1916] text-[#FAF9F6] border-r border-[#342D29] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`flex items-center justify-between border-b border-[#342D29] p-4 h-16 ${isCollapsed ? "justify-center" : "px-5"}`}>
          {!isCollapsed ? (
            <div 
              className="flex flex-col cursor-pointer overflow-hidden min-w-0" 
              onClick={() => navigate("/catalog")}
              title="Ke Katalog Produk"
            >
              <span className="font-brand text-lg tracking-[0.18em] uppercase text-white font-bold truncate">
                senna &amp; grace
              </span>
              <span className="text-[8px] tracking-[0.25em] uppercase text-[#B39274] font-bold -mt-0.5">
                Reseller Hub
              </span>
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-xl bg-[#2C2520] border border-[#3E342D] flex items-center justify-center text-[#B39274] cursor-pointer hover:border-[#B39274] transition-all"
              onClick={() => navigate("/catalog")}
              title="Senna & Grace Reseller"
            >
              <ShoppingBag size={18} />
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-[#B3A69C] hover:text-white hover:bg-[#2C2520] rounded-lg transition-all cursor-pointer"
              title="Perkecil Sidebar"
              id="btn-collapse-reseller-sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* User Card Shortcut */}
        {currentUser && (
          <div className={`p-3 border-b border-[#342D29] ${isCollapsed ? "flex justify-center" : ""}`}>
            {!isCollapsed ? (
              <div 
                onClick={() => setProfileModalOpen(true)}
                className="bg-[#2C2520] p-3 rounded-xl border border-[#3E342D] flex items-center gap-2.5 cursor-pointer hover:border-[#B39274] transition-all"
                title="Buka Pengaturan Profil Toko"
              >
                <div className="bg-[#B39274] text-[#1E1916] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                  {getInitials(currentUser.nama)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.nama}</p>
                  <p className="text-[9px] text-[#B39274] truncate flex items-center gap-1 font-medium">
                    <Store size={9} />
                    <span>{currentUser.namaTokoReseller || "Atur Toko"}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setProfileModalOpen(true)}
                className="w-10 h-10 rounded-xl bg-[#B39274] text-[#1E1916] flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-white/40 transition-all"
                title={`${currentUser.nama} (${currentUser.namaTokoReseller || "Profil"})`}
              >
                {getInitials(currentUser.nama)}
              </div>
            )}
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer ${
                  isCollapsed ? "justify-center p-3" : "px-3.5 py-3 gap-3"
                } ${
                  item.active
                    ? "bg-[#B39274] text-[#1E1916] font-bold shadow-sm"
                    : "text-[#B3A69C] hover:bg-[#2C2520] hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}

          {/* Cart Shortcut in Nav */}
          <button
            onClick={() => navigate("/cart")}
            title={isCollapsed ? `Keranjang (${totalCartProducts})` : undefined}
            className={`w-full flex items-center rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-3 relative" : "px-3.5 py-3 gap-3"
            } ${
              isCart
                ? "bg-[#B39274] text-[#1E1916] font-bold shadow-sm"
                : "text-[#B3A69C] hover:bg-[#2C2520] hover:text-white"
            }`}
          >
            <div className="relative shrink-0">
              <ShoppingCart size={18} />
              {isCollapsed && totalCartProducts > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B39274] text-[#1E1916] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartProducts}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">Keranjang</span>
                {totalCartProducts > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isCart ? "bg-[#1E1916] text-white" : "bg-[#B39274] text-[#1E1916]"}`}>
                    {totalCartProducts}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* Kemitraan Shortcut in Nav */}
          <button
            onClick={() => navigate("/kemitraan")}
            title={isCollapsed ? "Program Kemitraan" : undefined}
            className={`w-full flex items-center rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-3" : "px-3.5 py-3 gap-3"
            } ${
              isKemitraan
                ? "bg-[#B39274] text-[#1E1916] font-bold shadow-sm"
                : "text-[#B39274] hover:bg-[#2C2520] hover:text-white"
            }`}
          >
            <Sparkles size={18} className="shrink-0 text-[#B39274]" />
            {!isCollapsed && <span className="truncate">Program Kemitraan</span>}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#342D29] space-y-1.5">
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2.5 text-[#B3A69C] hover:text-white hover:bg-[#2C2520] rounded-xl transition-all cursor-pointer"
              title="Perluas Sidebar"
              id="btn-expand-reseller-sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}

          <button
            onClick={() => setProfileModalOpen(true)}
            title={isCollapsed ? "Pengaturan Profil" : undefined}
            className={`w-full flex items-center rounded-xl text-xs text-[#B3A69C] hover:text-white hover:bg-[#2C2520] transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5 gap-3"
            }`}
          >
            <Settings size={16} />
            {!isCollapsed && <span>Profil Toko</span>}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Keluar Akun" : undefined}
            className={`w-full flex items-center rounded-xl text-xs text-[#B3A69C] hover:text-white hover:bg-[#2C2520] transition-all cursor-pointer font-semibold ${
              isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5 gap-3"
            }`}
            id="sidebar-logout-button"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Keluar Akun</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="lg:hidden h-16 border-b border-[#EAE6DF] bg-white px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5" onClick={() => navigate("/catalog")}>
          <div className="w-8 h-8 rounded-lg bg-[#1E1916] text-[#B39274] flex items-center justify-center font-bold">
            <ShoppingBag size={16} />
          </div>
          <div>
            <span className="font-brand text-base tracking-[0.15em] uppercase text-[#1E1916] font-bold block leading-none">
              senna &amp; grace
            </span>
            <span className="text-[8px] uppercase text-[#B39274] font-bold tracking-wider">Reseller Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wishlist */}
          <button
            onClick={() => navigate("/catalog?wishlist=true")}
            className="p-2 text-[#1E1916] hover:text-[#B39274] transition-colors relative"
            title="Wishlist"
          >
            <Heart size={19} className={wishlist.length > 0 ? "fill-[#B39274] text-[#B39274]" : "text-[#1E1916]"} />
            {wishlist.length > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-[#1E1916] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 text-[#1E1916]"
            id="mobile-cart-trigger"
          >
            <ShoppingCart size={19} />
            {totalCartProducts > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#B39274] text-[#1E1916] text-[8px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-extrabold shadow-xs">
                {totalCartProducts}
              </span>
            )}
          </button>

          {/* Drawer trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-[#1E1916] hover:bg-[#FAF9F6] rounded-lg transition-colors cursor-pointer"
            id="mobile-menu-trigger"
            aria-label="Buka Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col z-10 bg-[#1E1916] text-[#FAF9F6] shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#342D29] flex items-center justify-between">
              <div>
                <span className="font-brand text-base tracking-[0.15em] uppercase text-white font-bold block">
                  senna &amp; grace
                </span>
                <span className="text-[9px] uppercase text-[#B39274] font-bold">Reseller Hub</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#B3A69C] hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info in drawer */}
            {currentUser && (
              <div className="p-4 border-b border-[#342D29]">
                <div 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="bg-[#2C2520] p-3 rounded-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="bg-[#B39274] text-[#1E1916] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                    {getInitials(currentUser.nama)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.nama}</p>
                    <p className="text-[10px] text-[#B39274] truncate">{currentUser.namaTokoReseller || "Atur Toko"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-wider uppercase font-semibold transition-all ${
                      item.active
                        ? "bg-[#B39274] text-[#1E1916] font-bold"
                        : "text-[#B3A69C] hover:bg-[#2C2520] hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  navigate("/cart");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs tracking-wider uppercase font-semibold transition-all ${
                  isCart
                    ? "bg-[#B39274] text-[#1E1916] font-bold"
                    : "text-[#B3A69C] hover:bg-[#2C2520] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} />
                  <span>Keranjang</span>
                </div>
                {totalCartProducts > 0 && (
                  <span className="bg-[#B39274] text-[#1E1916] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {totalCartProducts}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  navigate("/kemitraan");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs tracking-wider uppercase font-semibold text-[#B39274] hover:bg-[#2C2520] hover:text-white transition-all"
              >
                <Award size={18} />
                <span>Program Kemitraan</span>
              </button>
            </nav>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#342D29] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#B3A69C] hover:text-white rounded-xl"
              >
                <Settings size={16} />
                <span>Pengaturan Profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#B3A69C] hover:text-white hover:bg-[#2C2520] rounded-xl"
              >
                <LogOut size={16} />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SECURE TOPBAR WITH COLLAPSE TOGGLE */}
      <header 
        className={`hidden lg:flex items-center justify-between h-16 bg-white border-b border-[#EAE6DF] px-8 sticky top-0 z-20 transition-all duration-300 ${
          isCollapsed ? "pl-28" : "pl-72"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-[#7C634F] hover:text-[#1E1916] hover:bg-[#FAF9F6] rounded-xl border border-[#EAE6DF] transition-all cursor-pointer"
            title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
            id="btn-topbar-toggle-reseller-sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <div className="h-4 w-px bg-[#EAE6DF]"></div>

          <h1 className="text-sm font-bold text-[#1E1916] tracking-wide uppercase">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Wishlist Button */}
          <button
            onClick={() => navigate("/catalog?wishlist=true")}
            className="p-2 text-gray-500 hover:text-[#B39274] transition-colors relative group rounded-lg hover:bg-[#FAF9F6]"
            title="Koleksi Favorit"
          >
            <Heart size={20} className={wishlist.length > 0 ? "fill-[#B39274] text-[#B39274]" : "text-gray-500"} />
            {wishlist.length > 0 && (
              <span className="absolute 0 top-1 right-1 bg-[#1E1916] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-2xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="p-2 text-gray-500 hover:text-[#B39274] transition-colors relative group rounded-lg hover:bg-[#FAF9F6]"
            title="Keranjang Belanja"
          >
            <ShoppingCart size={20} />
            {totalCartProducts > 0 && (
              <span className="absolute top-1 right-1 bg-[#B39274] text-[#1E1916] text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-extrabold shadow-2xs">
                {totalCartProducts}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-[#EAE6DF]"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 border border-[#EAE6DF] hover:border-[#B39274] rounded-full bg-[#FAF9F6] transition-all cursor-pointer"
              id="desktop-profile-dropdown-trigger"
            >
              <div className="bg-[#1E1916] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-inner">
                {currentUser ? getInitials(currentUser.nama) : "R"}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-semibold text-[#1E1916] leading-none">
                  {currentUser ? currentUser.nama : "Grace Reseller"}
                </p>
                <p className="text-[10px] text-[#7C634F] font-medium mt-0.5 leading-none">
                  {currentUser?.namaTokoReseller || "Atur Profil"}
                </p>
              </div>
              <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-[#B39274]" : ""}`} />
            </button>

            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 bg-white border border-[#EAE6DF] rounded-2xl shadow-xl py-3 z-50 text-xs animate-in fade-in duration-150">
                  {currentUser && (
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-[#FAF9F6]/50">
                      <p className="font-bold text-gray-900 text-xs truncate">{currentUser.nama}</p>
                      <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                      {currentUser.namaTokoReseller && (
                        <p className="text-[10px] text-[#B39274] font-medium mt-1 flex items-center gap-1">
                          <Store size={10} /> {currentUser.namaTokoReseller}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                    >
                      <Settings size={14} className="text-[#B39274]" />
                      <span>Pengaturan Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/kemitraan");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2.5"
                    >
                      <Award size={14} className="text-[#B39274]" />
                      <span>Program Kemitraan</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5 border-t border-gray-100 mt-1 font-semibold"
                    >
                      <LogOut size={14} className="text-red-500" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER WORKSPACE */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* PENGATURAN PROFIL MODAL */}
      {profileModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setProfileModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto"
        >
          <div 
            className="relative w-full max-w-lg bg-white border border-[#EAE6DF] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-in scale-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#1E1916] text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#B39274] font-bold block mb-0.5">
                  Reseller Account
                </span>
                <h2 className="text-lg font-bold text-white">Pengaturan Profil Reseller</h2>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <Check size={16} className="text-green-600 stroke-[3]" />
                  <span className="font-semibold">Profil Reseller berhasil disimpan!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-[#7C634F] flex items-center gap-1">
                    <UserIcon size={12} className="text-[#B39274]" /> Nama Reseller
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] focus:border-[#1E1916] text-xs font-semibold rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-[#7C634F] flex items-center gap-1">
                    <Store size={12} className="text-[#B39274]" /> Nama Toko / Boutique
                  </label>
                  <input
                    type="text"
                    required
                    value={namaTokoReseller}
                    onChange={(e) => setNamaTokoReseller(e.target.value)}
                    placeholder="Nama Toko Dropship Anda"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] focus:border-[#1E1916] text-xs font-semibold rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-[#7C634F] flex items-center gap-1">
                    <Phone size={12} className="text-[#B39274]" /> No WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={noTelepon}
                    onChange={(e) => setNoTelepon(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] focus:border-[#1E1916] text-xs font-semibold rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase font-bold text-[#7C634F] flex items-center gap-1">
                    <CreditCard size={12} className="text-[#B39274]" /> Info Rekening Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={rekeningBank}
                    onChange={(e) => setRekeningBank(e.target.value)}
                    placeholder="BCA 12345678 a/n Grace"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] focus:border-[#1E1916] text-xs font-semibold rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-wider uppercase font-bold text-[#7C634F] flex items-center gap-1">
                  <MapPin size={12} className="text-[#B39274]" /> Alamat Lengkap Toko / Pengirim
                </label>
                <textarea
                  rows={3}
                  required
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Alamat asal dropshipper untuk pencetakan label pengiriman..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] focus:border-[#1E1916] text-xs font-semibold rounded-xl outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#EAE6DF] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2.5 border border-[#EAE6DF] hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1E1916] text-white hover:bg-[#B39274] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save size={14} />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
