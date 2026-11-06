import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

let dbInstance: Database | null = null;
const dbPath = path.join(process.cwd(), "database.sqlite");

// Auto-save SQLite3 binary state to database.sqlite file on disk
export function saveDbToDisk(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("[SQLite3] Failed to write database.sqlite to disk:", err);
  }
}

export interface SQLiteWrapper {
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  run(sql: string, params?: any[]): Promise<{ changes: number }>;
  exec(sql: string): Promise<void>;
}

export async function getDb(): Promise<SQLiteWrapper> {
  if (!dbInstance) {
    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(dbPath);
        dbInstance = new SQL.Database(fileBuffer);
      } catch {
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    // Initialize SQLite tables
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        namaBrand TEXT NOT NULL,
        gambar TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        namaProduk TEXT NOT NULL,
        SKU TEXT,
        hargaSatuan INTEGER NOT NULL,
        stok INTEGER NOT NULL,
        gambar TEXT NOT NULL,
        brandId TEXT NOT NULL,
        garansi TEXT DEFAULT '2 Tahun',
        berat INTEGER DEFAULT 1000,
        estimasiPengiriman TEXT DEFAULT '2-3 Hari Kerja',
        deskripsi TEXT NOT NULL,
        clodeoProductId TEXT,
        gineeProductId TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nama TEXT NOT NULL,
        role TEXT NOT NULL,
        namaTokoReseller TEXT,
        noTelepon TEXT,
        rekeningBank TEXT,
        alamatLengkap TEXT,
        customTier TEXT,
        levelClaimRequest TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        tanggal TEXT NOT NULL,
        status TEXT NOT NULL,
        userId TEXT NOT NULL,
        namaUser TEXT NOT NULL,
        emailUser TEXT NOT NULL,
        alamatPengiriman TEXT NOT NULL,
        nomorResi TEXT,
        jenisPengiriman TEXT NOT NULL,
        biayaLayanan INTEGER DEFAULT 0,
        totalTagihan INTEGER NOT NULL,
        ongkosKirim INTEGER DEFAULT 0,
        buktiPembayaran TEXT,
        waktuUploadBukti TEXT,
        bankTujuan TEXT,
        namaPengirimTransfer TEXT,
        catatanPembayaran TEXT,
        statusVerifikasiBukti TEXT DEFAULT 'Belum Upload',
        clodeoOrderId TEXT,
        gineeOrderId TEXT,
        clodeoSyncStatus TEXT,
        gineeSyncStatus TEXT,
        duitkuReference TEXT,
        duitkuPaymentUrl TEXT,
        duitkuVaNumber TEXT,
        duitkuPaymentMethod TEXT,
        duitkuQrString TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS order_details (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        produkId TEXT NOT NULL,
        namaProduk TEXT NOT NULL,
        gambarProduk TEXT,
        SKU TEXT,
        hargaSatuan INTEGER NOT NULL,
        jumlah INTEGER NOT NULL,
        subtotal INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS integration_configs (
        platform TEXT PRIMARY KEY,
        apiKey TEXT NOT NULL,
        storeName TEXT NOT NULL,
        isConnected INTEGER DEFAULT 1
      );
    `);

    // Safe migration for new Duitku columns if table existed
    const newOrderCols = ["duitkuReference", "duitkuPaymentUrl", "duitkuVaNumber", "duitkuPaymentMethod", "duitkuQrString"];
    for (const col of newOrderCols) {
      try {
        dbInstance.run(`ALTER TABLE orders ADD COLUMN ${col} TEXT`);
      } catch {
        // column may already exist, ignore
      }
    }

    // Seed default luxury brands if brand table is empty
    const checkBrand = dbInstance.exec("SELECT COUNT(*) as count FROM brands");
    const count = checkBrand[0]?.values[0]?.[0] as number || 0;
    if (count === 0) {
      const initialBrands = [
        { id: "b1", namaBrand: "Louis Vuitton", gambar: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" },
        { id: "b2", namaBrand: "Charles & Keith", gambar: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80" },
        { id: "b3", namaBrand: "Gucci", gambar: "/assets/aistudio/images_e9ad665f.jpeg" },
        { id: "b4", namaBrand: "Chanel", gambar: "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&w=800&q=80" },
        { id: "b5", namaBrand: "Hermes", gambar: "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&w=800&q=80" },
        { id: "b6", namaBrand: "Prada", gambar: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80" },
        { id: "b7", namaBrand: "Dior", gambar: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80" }
      ];
      for (const b of initialBrands) {
        dbInstance.run("INSERT INTO brands (id, namaBrand, gambar) VALUES (?, ?, ?)", [b.id, b.namaBrand, b.gambar]);
      }
    }

    // Seed 10 luxury bag products if products table is empty
    const checkProd = dbInstance.exec("SELECT COUNT(*) as count FROM products");
    const prodCount = checkProd[0]?.values[0]?.[0] as number || 0;
    if (prodCount === 0) {
      const initialProducts = [
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

      for (const p of initialProducts) {
        dbInstance.run(
          `INSERT INTO products (id, namaProduk, SKU, hargaSatuan, stok, gambar, brandId, garansi, berat, estimasiPengiriman, deskripsi)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.id, p.namaProduk, p.SKU, p.hargaSatuan, p.stok, p.gambar, p.brandId, p.garansi, p.berat, p.estimasiPengiriman, p.deskripsi]
        );
      }
    }

    // Seed default admin and reseller accounts
    const initialUsers = [
      { id: "u1", nama: "Grace Reseller", email: "reseller@senna.com", password: "password", role: "user" },
      { id: "a1", nama: "Senna Admin", email: "admin@senna.com", password: "admin", role: "admin" },
      { id: "a2", nama: "Admin Senna Grace", email: "admin@sennagrace.com", password: "admin", role: "admin" }
    ];
    for (const u of initialUsers) {
      const exists = dbInstance.exec("SELECT id FROM users WHERE LOWER(email) = '" + u.email.toLowerCase() + "'");
      if (!exists || exists.length === 0 || !exists[0].values.length) {
        dbInstance.run(
          "INSERT INTO users (id, nama, email, password, role) VALUES (?, ?, ?, ?, ?)",
          [u.id, u.nama, u.email, u.password, u.role]
        );
      }
    }

    saveDbToDisk();
  }

  const db = dbInstance;

  return {
    async all<T = any>(sql: string, params?: any[]): Promise<T[]> {
      const res = db.exec(sql, params || []);
      if (!res || res.length === 0) return [];
      const columns = res[0].columns;
      const values = res[0].values;
      return values.map((row) => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj as T;
      });
    },

    async get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
      const rows = (await this.all(sql, params)) as T[];
      return rows[0];
    },

    async run(sql: string, params?: any[]): Promise<{ changes: number }> {
      db.run(sql, params || []);
      saveDbToDisk();
      return { changes: 1 };
    },

    async exec(sql: string): Promise<void> {
      db.exec(sql);
      saveDbToDisk();
    }
  };
}
