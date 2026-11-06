import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Store
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, orders } = useApp();
  
  // Sidebar collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", JSON.stringify(isCollapsed));
    } catch (e) {
      console.error(e);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login-admin");
  };

  // Pending verification count for notification badge
  const pendingProofCount = orders.filter(o => o.buktiPembayaran && o.status === "Menunggu Pembayaran").length;

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: LayoutDashboard,
      active: location.pathname === "/admin-dashboard",
      badge: null
    },
    {
      name: "Produk",
      path: "/admin-products",
      icon: Package,
      active: location.pathname === "/admin-products",
      badge: null
    },
    {
      name: "Brand",
      path: "/admin-brands",
      icon: Tags,
      active: location.pathname === "/admin-brands",
      badge: null
    },
    {
      name: "Orders",
      path: "/admin-orders",
      icon: ClipboardList,
      active: location.pathname === "/admin-orders",
      badge: pendingProofCount > 0 ? pendingProofCount : null
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col selection:bg-[#B39274] selection:text-[#1E1916]">
      
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#12100E] text-[#FAF9F6] border-r border-[#2C2520] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className={`flex items-center justify-between border-b border-[#2C2520] p-4 h-16 ${isCollapsed ? "justify-center" : "px-5"}`}>
          {!isCollapsed ? (
            <div 
              className="flex flex-col cursor-pointer overflow-hidden min-w-0" 
              onClick={() => navigate("/")}
              title="Ke Halaman Publik"
            >
              <span className="font-brand text-lg tracking-[0.18em] uppercase text-white font-bold truncate">
                senna &amp; grace
              </span>
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#B39274] font-bold flex items-center gap-1 -mt-0.5">
                <Shield size={9} />
                <span>Admin Portal</span>
              </span>
            </div>
          ) : (
            <div 
              className="w-10 h-10 rounded-xl bg-[#231E1A] border border-[#3E342D] flex items-center justify-center text-[#B39274] cursor-pointer hover:border-[#B39274] transition-all"
              onClick={() => navigate("/")}
              title="Senna & Grace Admin"
            >
              <Shield size={18} />
            </div>
          )}

          {/* Toggle Button in Header */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-[#B3A69C] hover:text-white hover:bg-[#231E1A] rounded-lg transition-all cursor-pointer"
              title="Sembunyikan / Perkecil Sidebar"
              id="btn-collapse-admin-sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* User Badge */}
        {currentUser && (
          <div className={`p-3 border-b border-[#2C2520] ${isCollapsed ? "flex justify-center" : ""}`}>
            {!isCollapsed ? (
              <div className="bg-[#1C1815] p-3 rounded-xl border border-[#2C2520] flex items-center gap-2.5">
                <div className="bg-[#B39274] text-[#1E1916] p-2 rounded-lg shrink-0">
                  <UserIcon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.nama}</p>
                  <p className="text-[9px] text-[#B39274] font-bold tracking-wider uppercase">Super Admin</p>
                </div>
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-xl bg-[#B39274]/15 text-[#B39274] border border-[#B39274]/30 flex items-center justify-center"
                title={`${currentUser.nama} (Super Admin)`}
              >
                <UserIcon size={16} />
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
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
                    : "text-[#B3A69C] hover:bg-[#231E1A] hover:text-white"
                }`}
              >
                <div className="relative shrink-0">
                  <Icon size={18} />
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#B39274] text-[#1E1916] text-[9px] font-extrabold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="bg-[#B39274] text-[#1E1916] text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#2C2520] space-y-1.5">
          {/* Quick Collapse / Expand button for collapsed mode */}
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2.5 text-[#B3A69C] hover:text-white hover:bg-[#231E1A] rounded-xl transition-all cursor-pointer"
              title="Buka / Perluas Sidebar"
              id="btn-expand-admin-sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            title={isCollapsed ? "Halaman Publik" : undefined}
            className={`w-full flex items-center rounded-xl text-xs text-[#B3A69C] hover:text-white hover:bg-[#231E1A] transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5 gap-3"
            }`}
          >
            <Home size={16} />
            {!isCollapsed && <span>Halaman Publik</span>}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout Portal" : undefined}
            className={`w-full flex items-center rounded-xl text-xs text-[#B3A69C] hover:text-white hover:bg-[#231E1A] transition-all cursor-pointer font-semibold ${
              isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5 gap-3"
            }`}
            id="btn-admin-logout"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="lg:hidden h-16 border-b border-[#EAE6DF] bg-[#12100E] text-white px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-[#B39274] text-[#1E1916] flex items-center justify-center">
            <Shield size={16} />
          </div>
          <div>
            <span className="font-brand text-base tracking-[0.15em] uppercase text-white font-bold block leading-none">
              senna &amp; grace
            </span>
            <span className="text-[8px] uppercase text-[#B39274] font-bold tracking-wider">Admin Portal</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          id="mobile-admin-menu-trigger"
          aria-label="Buka Menu Admin"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col z-10 bg-[#12100E] text-[#FAF9F6] shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header in Drawer */}
            <div className="p-4 border-b border-[#2C2520] flex items-center justify-between">
              <div>
                <span className="font-brand text-base tracking-[0.15em] uppercase text-white font-bold block">
                  senna &amp; grace
                </span>
                <span className="text-[9px] uppercase text-[#B39274] font-bold">Admin Portal</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#B3A69C] hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs tracking-wider uppercase font-semibold transition-all ${
                      item.active
                        ? "bg-[#B39274] text-[#1E1916] font-bold"
                        : "text-[#B3A69C] hover:bg-[#231E1A] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#B39274] text-[#1E1916] text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-[#2C2520] space-y-2">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#B3A69C] hover:text-white rounded-xl"
              >
                <Home size={16} />
                <span>Halaman Publik</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#B3A69C] hover:text-white hover:bg-[#231E1A] rounded-xl"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP TOP HEADER / STATUS BAR */}
      <div 
        className={`hidden lg:flex items-center justify-between h-16 bg-white border-b border-[#EAE6DF] px-8 sticky top-0 z-20 transition-all duration-300 ${
          isCollapsed ? "pl-28" : "pl-72"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-[#7C634F] hover:text-[#1E1916] hover:bg-[#FAF9F6] rounded-xl border border-[#EAE6DF] transition-all cursor-pointer"
            title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
            id="btn-topbar-toggle-admin-sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          
          <div className="h-4 w-px bg-[#EAE6DF]"></div>

          <h2 className="text-sm font-bold text-[#1E1916] tracking-wide uppercase">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-semibold text-[#7C634F] hover:text-[#1E1916] px-3 py-1.5 rounded-lg hover:bg-[#FAF9F6] border border-transparent hover:border-[#EAE6DF] transition-all flex items-center gap-1.5"
          >
            <Store size={14} />
            <span>Lihat Toko Publik</span>
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-[#EAE6DF]">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-[#7C634F]">Admin Online</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WORKSPACE */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {children}
      </main>

    </div>
  );
}
