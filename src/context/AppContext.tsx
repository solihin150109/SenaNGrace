import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Brand, Produk, Order, CartItem, OrderDetail, OrderStatus, AlamatPengiriman } from "../types";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  brands: Brand[];
  products: Produk[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (nama: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (user: Partial<User>) => void;
  updateUserByAdmin: (userId: string, updatedFields: Partial<User>) => void;

  // Product CRUD
  addProduct: (p: Omit<Produk, "id">) => void;
  updateProduct: (p: Produk) => void;
  deleteProduct: (id: string) => void;

  // Brand CRUD
  addBrand: (nama: string, gambar?: string) => void;
  updateBrand: (b: Brand) => void;
  deleteBrand: (id: string) => void;

  // Cart & Wishlist
  addToCart: (p: Produk, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;

  // Orders
  createOrder: (alamat: AlamatPengiriman, kurir: string, ongkosKirim?: number) => Promise<Order | null>;
  payOrder: (orderId: string) => void;
  uploadPaymentProof: (
    orderId: string, 
    buktiPembayaran: string, 
    data?: { bankTujuan?: string; namaPengirimTransfer?: string; catatanPembayaran?: string }
  ) => void;
  verifyPaymentProof: (orderId: string, approved: boolean, reason?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, resi?: string) => void;

  // Omnichannel Integrations (Clodeo & Ginee)
  clodeoApiKey: string;
  clodeoStoreName: string;
  isClodeoConnected: boolean;
  gineeApiKey: string;
  gineeStoreName: string;
  isGineeConnected: boolean;
  saveClodeoConfig: (apiKey: string, storeName: string) => void;
  saveGineeConfig: (apiKey: string, storeName: string) => void;
  disconnectClodeo: () => void;
  disconnectGinee: () => void;
  syncProductToPlatform: (productId: string, platform: "Clodeo" | "Ginee") => Promise<{ success: boolean; message: string; externalId?: string }>;
  syncOrderToPlatform: (orderId: string, platform: "Clodeo" | "Ginee") => Promise<{ success: boolean; message: string; externalId?: string; resi?: string }>;

  // Duitku Payment Gateway
  createDuitkuInvoice: (orderId: string, paymentMethod?: string) => Promise<{ success: boolean; reference?: string; paymentUrl?: string; vaNumber?: string; qrString?: string; error?: string }>;
  simulateDuitkuPay: (orderId: string) => Promise<{ success: boolean; message?: string }>;
  checkDuitkuPaymentStatus: (orderId: string) => Promise<{ isPaid: boolean; status: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial brand seed data
export const INITIAL_BRANDS: Brand[] = [
  { 
    id: "b1", 
    namaBrand: "Louis Vuitton", 
    gambar: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b2", 
    namaBrand: "Charles & Keith", 
    gambar: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b3", 
    namaBrand: "Gucci", 
    gambar: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b4", 
    namaBrand: "Chanel", 
    gambar: "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b5", 
    namaBrand: "Hermes", 
    gambar: "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b6", 
    namaBrand: "Prada", 
    gambar: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    id: "b7", 
    namaBrand: "Dior", 
    gambar: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80" 
  }
];

export const SAMPLE_RECEIPT_IMAGE = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80";

export const INITIAL_PRODUCTS: Produk[] = [
  {
    id: "p1",
    namaProduk: "Gucci Ophidia GG Small Shoulder Bag",
    SKU: "GUC-OPH-001",
    hargaSatuan: 18500000,
    stok: 20,
    gambar: "/assets/aistudio/images_e9ad665f.jpeg",
    brandId: "b3",
    garansi: "2 Tahun",
    berat: 850,
    estimasiPengiriman: "1-2 Hari Kerja",
    deskripsi: "Tas bahu ikonik Gucci Ophidia dengan motif GG Supreme canvas, detail web stripe hijau-merah khas Italia, dan aksen Double G berlapis emas antik. Sangat elegan dan fleksibel untuk acara formal maupun santai."
  },
  {
    id: "p2",
    namaProduk: "Louis Vuitton Neverfull MM Monogram",
    SKU: "LV-NF-MM01",
    hargaSatuan: 28500000,
    stok: 15,
    gambar: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    brandId: "b1",
    garansi: "2 Tahun",
    berat: 950,
    estimasiPengiriman: "2-3 Hari Kerja",
    deskripsi: "Tote bag klasik Louis Vuitton Neverfull MM terbuat dari kanvas Monogram lentur dengan trim kulit sapi alami. Dilengkapi pouch ritsleting lepas-pasang yang dapat digunakan secara terpisah."
  },
  {
    id: "p3",
    namaProduk: "Chanel Classic Double Flap Bag Medium",
    SKU: "CHN-CF-M01",
    hargaSatuan: 95000000,
    stok: 8,
    gambar: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    brandId: "b4",
    garansi: "3 Tahun",
    berat: 1100,
    estimasiPengiriman: "1-2 Hari Kerja",
    deskripsi: "Tas mahakarya legendaris Chanel berbalut kulit Caviar bertekstur kokoh dengan pengait lock CC putar emas dan tali rantai beranyam kulit halus. Standar kemewahan busana Prancis sejati."
  },
  {
    id: "p4",
    namaProduk: "Hermès Birkin 25 Togo Gold Hardware",
    SKU: "HMS-BK-25G",
    hargaSatuan: 245000000,
    stok: 5,
    gambar: "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&w=800&q=80",
    brandId: "b5",
    garansi: "5 Tahun",
    berat: 1200,
    estimasiPengiriman: "1-2 Hari Kerja",
    deskripsi: "Koleksi paling prestisius di dunia mode internasional, Hermès Birkin 25 berbahan kulit Togo warna emas dengan hardware berlapis emas bersinar, gembok gembira dan clochette asli."
  },
  {
    id: "p5",
    namaProduk: "Prada Re-Edition 2005 Re-Nylon Shoulder Bag",
    SKU: "PRD-RE05-NY",
    hargaSatuan: 22000000,
    stok: 25,
    gambar: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
    brandId: "b6",
    garansi: "2 Tahun",
    berat: 650,
    estimasiPengiriman: "2-3 Hari Kerja",
    deskripsi: "Tas bahu Re-Nylon multifungsi Prada dengan detail Saffiano leather, tali bahu rantai emas lepas-pasang, serta pouch koin terpisah berlogo segitiga enamel khas Prada."
  },
  {
    id: "p6",
    namaProduk: "Lady Dior Medium Cannage Lambskin",
    SKU: "DIR-LD-MED",
    hargaSatuan: 78000000,
    stok: 12,
    gambar: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
    brandId: "b7",
    garansi: "3 Tahun",
    berat: 1050,
    estimasiPengiriman: "2-3 Hari Kerja",
    deskripsi: "Mahakarya rumah mode Dior yang melambangkan keanggunan sejati, terbuat dari kulit domba Cannage hitam dengan gantungan charm D.I.O.R berlapis emas pucat berkilau."
  },
  {
    id: "p7",
    namaProduk: "Charles & Keith Gabine Saddle Bag",
    SKU: "CK-GAB-001",
    hargaSatuan: 1499000,
    stok: 35,
    gambar: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    brandId: "b2",
    garansi: "1 Tahun",
    berat: 750,
    estimasiPengiriman: "1-2 Hari Kerja",
    deskripsi: "Tas saddle best-seller Charles & Keith dengan siluet melengkung klasik, aksen gesper D-ring emas, serta strap ganda untuk gaya bahu dan selempang kasual sehari-hari."
  },
  {
    id: "p8",
    namaProduk: "Louis Vuitton Speedy Bandoulière 25",
    SKU: "LV-SPD-25B",
    hargaSatuan: 25500000,
    stok: 18,
    gambar: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a4a5?auto=format&fit=crop&w=800&q=80",
    brandId: "b1",
    garansi: "2 Tahun",
    berat: 850,
    estimasiPengiriman: "2-3 Hari Kerja",
    deskripsi: "Siluet abadi Louis Vuitton Speedy 25 dengan kanvas Monogram legendaris, pegangan ganda kulit Toron rolled yang nyaman digenggam, serta tali bahu kulit yang dapat disesuaikan."
  },
  {
    id: "p9",
    namaProduk: "Gucci GG Marmont Small Matelassé",
    SKU: "GUC-MAR-SM",
    hargaSatuan: 26000000,
    stok: 14,
    gambar: "https://images.unsplash.com/photo-1598532187856-3c2243d5f0cc?auto=format&fit=crop&w=800&q=80",
    brandId: "b3",
    garansi: "2 Tahun",
    berat: 900,
    estimasiPengiriman: "2-3 Hari Kerja",
    deskripsi: "Tas bahu Gucci Marmont berlapis kulit chevron matelassé hitam halus, logo Double G emas antik di bagian depan, dan rantai bahu yang nyaman disampirkan."
  },
  {
    id: "p10",
    namaProduk: "Hermès Kelly 28 Epsom Sellier",
    SKU: "HMS-KL-28E",
    hargaSatuan: 260000000,
    stok: 4,
    gambar: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80",
    brandId: "b5",
    garansi: "5 Tahun",
    berat: 1250,
    estimasiPengiriman: "1-2 Hari Kerja",
    deskripsi: "Tas Hermès Kelly 28 berstruktur Sellier presisi dari kulit Epsom kokoh dengan hardware paladium perak eksklusif, lambang kemewahan aristokrat kelas dunia."
  }
];

const INITIAL_USERS: User[] = [
  { id: "u1", nama: "Grace Reseller", email: "reseller@senna.com", password: "password", role: "user" },
  { id: "a1", nama: "Senna Admin", email: "admin@senna.com", password: "admin", role: "admin" },
  { id: "a2", nama: "Admin Senna Grace", email: "admin@sennagrace.com", password: "admin", role: "admin" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State definitions with local storage fallback
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("sg_users");
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem("sg_brands");
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [products, setProducts] = useState<Produk[]>(() => {
    try {
      const saved = localStorage.getItem("sg_products");
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("sg_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("sg_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("sg_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sg_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Omnichannel integration configs
  const [clodeoApiKey, setClodeoApiKey] = useState<string>(() => localStorage.getItem("sg_clodeo_api_key") || "");
  const [clodeoStoreName, setClodeoStoreName] = useState<string>(() => localStorage.getItem("sg_clodeo_store_name") || "");
  const [isClodeoConnected, setIsClodeoConnected] = useState<boolean>(() => localStorage.getItem("sg_clodeo_connected") === "true");

  const [gineeApiKey, setGineeApiKey] = useState<string>(() => localStorage.getItem("sg_ginee_api_key") || "");
  const [gineeStoreName, setGineeStoreName] = useState<string>(() => localStorage.getItem("sg_ginee_store_name") || "");
  const [isGineeConnected, setIsGineeConnected] = useState<boolean>(() => localStorage.getItem("sg_ginee_connected") === "true");

  // ==========================================
  // FETCH INITIAL DATA FROM SQLite3 BACKEND
  // ==========================================
  useEffect(() => {
    const fetchFromSqlite = async () => {
      try {
        // Fetch Brands from SQLite
        const bRes = await fetch("/api/brands");
        if (bRes.ok) {
          const bData: Brand[] = await bRes.json();
          if (bData && bData.length > 0) {
            setBrands(bData);
            localStorage.setItem("sg_brands", JSON.stringify(bData));
          }
        }

        // Fetch Products from SQLite
        const pRes = await fetch("/api/products");
        if (pRes.ok) {
          const pData: Produk[] = await pRes.json();
          if (pData && pData.length > 0) {
            setProducts(pData);
            localStorage.setItem("sg_products", JSON.stringify(pData));
          } else {
            setProducts(INITIAL_PRODUCTS);
            localStorage.setItem("sg_products", JSON.stringify(INITIAL_PRODUCTS));
            for (const item of INITIAL_PRODUCTS) {
              fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
              }).catch(() => {});
            }
          }
        }

        // Fetch Orders from SQLite
        const oRes = await fetch("/api/orders");
        if (oRes.ok) {
          const oData: Order[] = await oRes.json();
          setOrders(oData);
          localStorage.setItem("sg_orders", JSON.stringify(oData));
        }

        // Fetch Users from SQLite
        const uRes = await fetch("/api/users");
        if (uRes.ok) {
          const uData: User[] = await uRes.json();
          if (uData && uData.length > 0) {
            setUsers(uData);
            localStorage.setItem("sg_users", JSON.stringify(uData));
          }
        }

        // Fetch Integrations
        const iRes = await fetch("/api/integrations");
        if (iRes.ok) {
          const iData: Array<{ platform: string; apiKey: string; storeName: string }> = await iRes.json();
          iData.forEach((c) => {
            if (c.platform === "Clodeo") {
              setClodeoApiKey(c.apiKey);
              setClodeoStoreName(c.storeName);
              setIsClodeoConnected(true);
            } else if (c.platform === "Ginee") {
              setGineeApiKey(c.apiKey);
              setGineeStoreName(c.storeName);
              setIsGineeConnected(true);
            }
          });
        }
      } catch (err) {
        console.warn("[SQLite Client] Backend connection in progress, using cached state:", err);
      }
    };

    fetchFromSqlite();
  }, []);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem("sg_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("sg_brands", JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem("sg_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("sg_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("sg_current_user", currentUser ? JSON.stringify(currentUser) : "");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("sg_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("sg_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ==========================================
  // AUTHENTICATION (SQLite3 Powered)
  // ==========================================
  const loginUser = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass, role: "user" })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        return { success: true };
      } else {
        // Fallback local check
        const localFound = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (localFound && localFound.role === "user") {
          setCurrentUser(localFound);
          return { success: true };
        }
        return { success: false, error: data.error || "Email atau password salah." };
      }
    } catch {
      const localFound = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (localFound && localFound.role === "user") {
        setCurrentUser(localFound);
        return { success: true };
      }
      return { success: false, error: "Email atau password salah." };
    }
  };

  const loginAdmin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass, role: "admin" })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
        return { success: true };
      } else {
        const localFound = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (localFound && localFound.role === "admin") {
          setCurrentUser(localFound);
          return { success: true };
        }
        return { success: false, error: data.error || "Akun Anda tidak memiliki akses Admin." };
      }
    } catch {
      const localFound = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (localFound && localFound.role === "admin") {
        setCurrentUser(localFound);
        return { success: true };
      }
      return { success: false, error: "Email atau password salah." };
    }
  };

  const registerUser = async (nama: string, email: string, pass: string) => {
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => [...prev, data]);
        setCurrentUser(data);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Pendaftaran gagal." };
      }
    } catch {
      const newUser: User = {
        id: "u_" + Date.now(),
        nama,
        email,
        password: pass,
        role: "user"
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  // ==========================================
  // PRODUCT CRUD (SQLite3 Powered)
  // ==========================================
  const addProduct = async (p: Omit<Produk, "id">) => {
    const newProduct: Produk = {
      ...p,
      stok: Math.max(10, p.stok),
      id: "prod_" + Date.now()
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
    } catch (err) {
      console.error("Failed to sync addProduct with SQLite3:", err);
    }
  };

  const updateProduct = async (p: Produk) => {
    const safeProduct = { ...p, stok: Math.max(10, p.stok) };
    setProducts(prev => prev.map(item => item.id === p.id ? safeProduct : item));
    setCart(prev => prev.map(item => {
      if (item.produk.id === p.id) {
        return { ...item, produk: safeProduct, jumlah: Math.min(item.jumlah, safeProduct.stok) };
      }
      return item;
    }).filter(item => item.jumlah >= 10));

    try {
      await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeProduct)
      });
    } catch (err) {
      console.error("Failed to sync updateProduct with SQLite3:", err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.produk.id !== id));
    setWishlist(prev => prev.filter(pId => pId !== id));

    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync deleteProduct with SQLite3:", err);
    }
  };

  // ==========================================
  // BRAND CRUD (SQLite3 Powered)
  // ==========================================
  const addBrand = async (nama: string, gambar?: string) => {
    const newBrand: Brand = {
      id: "b_" + Date.now(),
      namaBrand: nama.trim(),
      gambar: gambar?.trim() || undefined
    };
    setBrands(prev => [...prev, newBrand]);

    try {
      await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBrand)
      });
    } catch (err) {
      console.error("Failed to sync addBrand with SQLite3:", err);
    }
  };

  const updateBrand = async (b: Brand) => {
    setBrands(prev => prev.map(item => item.id === b.id ? b : item));

    try {
      await fetch(`/api/brands/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b)
      });
    } catch (err) {
      console.error("Failed to sync updateBrand with SQLite3:", err);
    }
  };

  const deleteBrand = async (id: string) => {
    setBrands(prev => prev.filter(item => item.id !== id));

    try {
      await fetch(`/api/brands/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync deleteBrand with SQLite3:", err);
    }
  };

  // ==========================================
  // CART & WISHLIST
  // ==========================================
  const addToCart = (p: Produk, qty: number = 1) => {
    const safeQty = Math.max(1, qty);
    if (p.stok <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.produk.id === p.id);
      if (existing) {
        const newQty = Math.min(existing.jumlah + safeQty, p.stok);
        return prev.map(item => item.produk.id === p.id ? { ...item, jumlah: newQty } : item);
      } else {
        return [...prev, { produk: p, jumlah: Math.min(safeQty, p.stok) }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.produk.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.produk.id === productId) {
        const prod = products.find(p => p.id === productId);
        const limit = prod ? prod.stok : item.produk.stok;
        return { ...item, jumlah: Math.max(1, Math.min(qty, limit)) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // ==========================================
  // ORDERS (SQLite3 Powered)
  // ==========================================
  const createOrder = async (alamat: AlamatPengiriman, kurir: string, ongkosKirim: number = 0): Promise<Order | null> => {
    if (!currentUser || cart.length === 0) return null;

    for (const item of cart) {
      if (item.jumlah < 1) return null;
      const prod = products.find(p => p.id === item.produk.id);
      if (!prod || prod.stok < item.jumlah) return null;
    }

    const orderId = "SG-ORD-" + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((acc, item) => acc + (item.produk.hargaSatuan * item.jumlah), 0);
    const biayaLayanan = 25000;
    const totalTagihan = subtotal + biayaLayanan + ongkosKirim;

    // Deduct stock in UI state
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.produk.id === p.id);
      if (cartItem) {
        return { ...p, stok: p.stok - cartItem.jumlah };
      }
      return p;
    }));

    const orderDetails: OrderDetail[] = cart.map((item, idx) => ({
      id: `od_${orderId}_${idx}`,
      produkId: item.produk.id,
      namaProduk: item.produk.namaProduk,
      gambarProduk: item.produk.gambar,
      SKU: item.produk.SKU,
      hargaSatuan: item.produk.hargaSatuan,
      jumlah: item.jumlah,
      subtotal: item.produk.hargaSatuan * item.jumlah
    }));

    const newOrder: Order = {
      id: orderId,
      tanggal: new Date().toISOString(),
      status: "Menunggu Pembayaran",
      userId: currentUser.id,
      namaUser: currentUser.nama,
      emailUser: currentUser.email,
      alamatPengiriman: alamat,
      jenisPengiriman: kurir,
      biayaLayanan,
      totalTagihan,
      details: orderDetails,
      ongkosKirim
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);

    // Persist into SQLite3
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const savedOrder = await res.json();
        return savedOrder;
      }
    } catch (err) {
      console.error("Failed to sync createOrder with SQLite3:", err);
    }

    return newOrder;
  };

  const payOrder = async (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId && ord.status === "Menunggu Pembayaran") {
        return { 
          ...ord, 
          status: "Diproses",
          statusVerifikasiBukti: "Terverifikasi"
        };
      }
      return ord;
    }));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Diproses",
          statusVerifikasiBukti: "Terverifikasi"
        })
      });
    } catch (err) {
      console.error("Failed to sync payOrder with SQLite3:", err);
    }
  };

  const uploadPaymentProof = async (
    orderId: string, 
    buktiPembayaran: string, 
    data?: { bankTujuan?: string; namaPengirimTransfer?: string; catatanPembayaran?: string }
  ) => {
    const payload = {
      buktiPembayaran,
      waktuUploadBukti: new Date().toISOString(),
      bankTujuan: data?.bankTujuan,
      namaPengirimTransfer: data?.namaPengirimTransfer,
      catatanPembayaran: data?.catatanPembayaran,
      statusVerifikasiBukti: "Menunggu Verifikasi"
    };

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          ...payload,
          bankTujuan: payload.bankTujuan || ord.bankTujuan,
          namaPengirimTransfer: payload.namaPengirimTransfer || ord.namaPengirimTransfer,
          catatanPembayaran: payload.catatanPembayaran || ord.catatanPembayaran,
          statusVerifikasiBukti: "Menunggu Verifikasi"
        };
      }
      return ord;
    }));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Failed to sync uploadPaymentProof with SQLite3:", err);
    }
  };

  const verifyPaymentProof = async (orderId: string, approved: boolean, reason?: string) => {
    const updates = approved
      ? { status: "Diproses" as OrderStatus, statusVerifikasiBukti: "Terverifikasi" as const }
      : {
          status: "Menunggu Pembayaran" as OrderStatus,
          statusVerifikasiBukti: "Ditolak" as const,
          catatanPembayaran: reason || "Bukti transfer tidak valid. Silakan upload ulang."
        };

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, ...updates };
      }
      return ord;
    }));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Failed to sync verifyPaymentProof with SQLite3:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, resi?: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { 
          ...ord, 
          status,
          nomorResi: resi !== undefined ? resi : ord.nomorResi 
        };
      }
      return ord;
    }));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, nomorResi: resi })
      });
    } catch (err) {
      console.error("Failed to sync updateOrderStatus with SQLite3:", err);
    }
  };

  // ==========================================
  // DUITKU PAYMENT GATEWAY
  // ==========================================
  const createDuitkuInvoice = async (orderId: string, paymentMethod: string = "QR") => {
    try {
      const res = await fetch("/api/duitku/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          email: currentUser?.email,
          customerName: currentUser?.nama
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Gagal membuat invoice Duitku" };
      }

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        duitkuReference: data.reference,
        duitkuPaymentUrl: data.paymentUrl,
        duitkuVaNumber: data.vaNumber,
        duitkuPaymentMethod: data.paymentMethod,
        duitkuQrString: data.qrString
      } : o));

      return {
        success: true,
        reference: data.reference,
        paymentUrl: data.paymentUrl,
        vaNumber: data.vaNumber,
        qrString: data.qrString
      };
    } catch (err: any) {
      console.error("createDuitkuInvoice error:", err);
      return { success: false, error: err.message || "Koneksi gateway gagal" };
    }
  };

  const simulateDuitkuPay = async (orderId: string) => {
    try {
      const res = await fetch("/api/duitku/simulate-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || "Gagal verifikasi pembayaran" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const checkDuitkuPaymentStatus = async (orderId: string) => {
    try {
      const res = await fetch("/api/duitku/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.isPaid) {
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          status: data.status,
          statusVerifikasiBukti: data.statusVerifikasiBukti
        } : o));
      }
      return { isPaid: !!data.isPaid, status: data.status };
    } catch (err) {
      return { isPaid: false, status: "Unknown" };
    }
  };

  // ==========================================
  // USER PROFILES (SQLite3 Powered)
  // ==========================================
  const updateUserProfile = async (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    const nextUser = { ...currentUser, ...updatedUser };
    setCurrentUser(nextUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? nextUser : u));

    try {
      await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      });
    } catch (err) {
      console.error("Failed to sync updateUserProfile with SQLite3:", err);
    }
  };

  const updateUserByAdmin = async (userId: string, updatedFields: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updatedFields });
    }

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error("Failed to sync updateUserByAdmin with SQLite3:", err);
    }
  };

  // ==========================================
  // INTEGRATION SETTINGS
  // ==========================================
  const saveClodeoConfig = async (apiKey: string, storeName: string) => {
    setClodeoApiKey(apiKey);
    setClodeoStoreName(storeName);
    setIsClodeoConnected(true);
    localStorage.setItem("sg_clodeo_api_key", apiKey);
    localStorage.setItem("sg_clodeo_store_name", storeName);
    localStorage.setItem("sg_clodeo_connected", "true");

    try {
      await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "Clodeo", apiKey, storeName })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const saveGineeConfig = async (apiKey: string, storeName: string) => {
    setGineeApiKey(apiKey);
    setGineeStoreName(storeName);
    setIsGineeConnected(true);
    localStorage.setItem("sg_ginee_api_key", apiKey);
    localStorage.setItem("sg_ginee_store_name", storeName);
    localStorage.setItem("sg_ginee_connected", "true");

    try {
      await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "Ginee", apiKey, storeName })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectClodeo = async () => {
    setClodeoApiKey("");
    setClodeoStoreName("");
    setIsClodeoConnected(false);
    localStorage.setItem("sg_clodeo_api_key", "");
    localStorage.setItem("sg_clodeo_store_name", "");
    localStorage.setItem("sg_clodeo_connected", "false");

    try {
      await fetch("/api/integrations/Clodeo", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectGinee = async () => {
    setGineeApiKey("");
    setGineeStoreName("");
    setIsGineeConnected(false);
    localStorage.setItem("sg_ginee_api_key", "");
    localStorage.setItem("sg_ginee_store_name", "");
    localStorage.setItem("sg_ginee_connected", "false");

    try {
      await fetch("/api/integrations/Ginee", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  const syncProductToPlatform = async (productId: string, platform: "Clodeo" | "Ginee"): Promise<{ success: boolean; message: string; externalId?: string }> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const extId = (platform === "Clodeo" ? "CLD-PROD-" : "GIN-PROD-") + Math.floor(100000 + Math.random() * 900000);
        const prod = products.find(p => p.id === productId);
        if (prod) {
          const updated = {
            ...prod,
            clodeoProductId: platform === "Clodeo" ? extId : prod.clodeoProductId,
            gineeProductId: platform === "Ginee" ? extId : prod.gineeProductId
          };
          setProducts(prev => prev.map(p => p.id === productId ? updated : p));
          try {
            await fetch(`/api/products/${productId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updated)
            });
          } catch (e) {
            console.error(e);
          }
        }
        resolve({
          success: true,
          message: `Produk berhasil disinkronisasi ke ${platform} sebagai SKU global.`,
          externalId: extId
        });
      }, 600);
    });
  };

  const syncOrderToPlatform = async (orderId: string, platform: "Clodeo" | "Ginee"): Promise<{ success: boolean; message: string; externalId?: string; resi?: string }> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const extId = (platform === "Clodeo" ? "CLD-ORD-" : "GIN-ORD-") + Math.floor(100000 + Math.random() * 900000);
        const resi = (platform === "Clodeo" ? "CLD-RESI-" : "GIN-RESI-") + Math.floor(10000000 + Math.random() * 90000000);
        const ord = orders.find(o => o.id === orderId);
        if (ord) {
          const updated = {
            ...ord,
            clodeoOrderId: platform === "Clodeo" ? extId : ord.clodeoOrderId,
            gineeOrderId: platform === "Ginee" ? extId : ord.gineeOrderId,
            clodeoSyncStatus: (platform === "Clodeo" ? "Synced" : ord.clodeoSyncStatus) as any,
            gineeSyncStatus: (platform === "Ginee" ? "Synced" : ord.gineeSyncStatus) as any,
            nomorResi: ord.nomorResi || resi
          };
          setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
          try {
            await fetch(`/api/orders/${orderId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clodeoOrderId: updated.clodeoOrderId,
                gineeOrderId: updated.gineeOrderId,
                clodeoSyncStatus: updated.clodeoSyncStatus,
                gineeSyncStatus: updated.gineeSyncStatus,
                nomorResi: updated.nomorResi
              })
            });
          } catch (e) {
            console.error(e);
          }
        }
        resolve({
          success: true,
          message: `Order ${orderId} berhasil dikirim ke logistik & kurir melalui ${platform}.`,
          externalId: extId,
          resi
        });
      }, 700);
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      brands,
      products,
      orders,
      cart,
      wishlist,
      loginUser,
      loginAdmin,
      registerUser,
      logout,
      updateUserProfile,
      updateUserByAdmin,
      addProduct,
      updateProduct,
      deleteProduct,
      addBrand,
      updateBrand,
      deleteBrand,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      createOrder,
      payOrder,
      uploadPaymentProof,
      verifyPaymentProof,
      updateOrderStatus,
      clodeoApiKey,
      clodeoStoreName,
      isClodeoConnected,
      gineeApiKey,
      gineeStoreName,
      isGineeConnected,
      saveClodeoConfig,
      saveGineeConfig,
      disconnectClodeo,
      disconnectGinee,
      syncProductToPlatform,
      syncOrderToPlatform,
      createDuitkuInvoice,
      simulateDuitkuPay,
      checkDuitkuPaymentStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
