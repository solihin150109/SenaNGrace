export interface DestinationZone {
  province: string;
  cities: {
    name: string;
    type: "Kota" | "Kabupaten";
    postalCodes: string[];
    basePerKg: {
      jneReg: number;
      jneYes?: number;
      sicepatReg: number;
      jntEz: number;
      instant?: number;
    };
    etdDays: string;
  }[];
}

export const INDONESIA_SHIPPING_DATABASE: DestinationZone[] = [
  {
    province: "DKI Jakarta",
    cities: [
      {
        name: "Jakarta Selatan",
        type: "Kota",
        postalCodes: ["12110", "12730", "12950", "12310"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 30000 },
        etdDays: "1-2 Hari (Instant 3-6 Jam)"
      },
      {
        name: "Jakarta Barat",
        type: "Kota",
        postalCodes: ["11460", "11530", "11820", "11730"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 25000 },
        etdDays: "1-2 Hari (Instant 3-6 Jam)"
      },
      {
        name: "Jakarta Pusat",
        type: "Kota",
        postalCodes: ["10110", "10220", "10350", "10410"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 30000 },
        etdDays: "1-2 Hari (Instant 3-6 Jam)"
      },
      {
        name: "Jakarta Timur",
        type: "Kota",
        postalCodes: ["13310", "13420", "13750", "13910"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 35000 },
        etdDays: "1-2 Hari (Instant 3-6 Jam)"
      },
      {
        name: "Jakarta Utara",
        type: "Kota",
        postalCodes: ["14110", "14240", "14410", "14350"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 35000 },
        etdDays: "1-2 Hari (Instant 3-6 Jam)"
      }
    ]
  },
  {
    province: "Banten",
    cities: [
      {
        name: "Tangerang",
        type: "Kota",
        postalCodes: ["15111", "15123", "15157"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 10000, jntEz: 10000, instant: 25000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Tangerang Selatan",
        type: "Kota",
        postalCodes: ["15411", "15310", "15322"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 10000, jntEz: 10000, instant: 30000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Serang",
        type: "Kota",
        postalCodes: ["42111", "42118"],
        basePerKg: { jneReg: 12000, jneYes: 22000, sicepatReg: 12000, jntEz: 11000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Cilegon",
        type: "Kota",
        postalCodes: ["42411", "42426"],
        basePerKg: { jneReg: 13000, jneYes: 24000, sicepatReg: 12500, jntEz: 12000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Jawa Barat",
    cities: [
      {
        name: "Bandung",
        type: "Kota",
        postalCodes: ["40111", "40115", "40232"],
        basePerKg: { jneReg: 12000, jneYes: 22000, sicepatReg: 12000, jntEz: 11000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Bekasi",
        type: "Kota",
        postalCodes: ["17111", "17144", "17134"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 35000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Depok",
        type: "Kota",
        postalCodes: ["16411", "16424", "16431"],
        basePerKg: { jneReg: 10000, jneYes: 20000, sicepatReg: 9500, jntEz: 10000, instant: 35000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Bogor",
        type: "Kota",
        postalCodes: ["16111", "16122", "16143"],
        basePerKg: { jneReg: 11000, jneYes: 21000, sicepatReg: 10500, jntEz: 10500, instant: 40000 },
        etdDays: "1-2 Hari"
      },
      {
        name: "Cirebon",
        type: "Kota",
        postalCodes: ["45111", "45124"],
        basePerKg: { jneReg: 14000, jneYes: 25000, sicepatReg: 13500, jntEz: 13000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Karawang",
        type: "Kabupaten",
        postalCodes: ["41311", "41314"],
        basePerKg: { jneReg: 11000, jneYes: 22000, sicepatReg: 11000, jntEz: 11000 },
        etdDays: "1-2 Hari"
      }
    ]
  },
  {
    province: "Jawa Tengah",
    cities: [
      {
        name: "Semarang",
        type: "Kota",
        postalCodes: ["50131", "50135", "50241"],
        basePerKg: { jneReg: 17000, jneYes: 30000, sicepatReg: 16500, jntEz: 16000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Surakarta (Solo)",
        type: "Kota",
        postalCodes: ["57111", "57126"],
        basePerKg: { jneReg: 17000, jneYes: 30000, sicepatReg: 16500, jntEz: 16000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Banyumas (Purwokerto)",
        type: "Kabupaten",
        postalCodes: ["53111", "53124"],
        basePerKg: { jneReg: 18000, jneYes: 32000, sicepatReg: 17500, jntEz: 17000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Tegal",
        type: "Kota",
        postalCodes: ["52111", "52123"],
        basePerKg: { jneReg: 16000, jneYes: 28000, sicepatReg: 15500, jntEz: 15000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "DI Yogyakarta",
    cities: [
      {
        name: "Yogyakarta",
        type: "Kota",
        postalCodes: ["55111", "55122", "55223"],
        basePerKg: { jneReg: 17000, jneYes: 30000, sicepatReg: 16500, jntEz: 16000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Sleman",
        type: "Kabupaten",
        postalCodes: ["55281", "55581"],
        basePerKg: { jneReg: 17000, jneYes: 30000, sicepatReg: 16500, jntEz: 16000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Bantul",
        type: "Kabupaten",
        postalCodes: ["55711", "55715"],
        basePerKg: { jneReg: 17000, jneYes: 30000, sicepatReg: 16500, jntEz: 16000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Jawa Timur",
    cities: [
      {
        name: "Surabaya",
        type: "Kota",
        postalCodes: ["60111", "60241", "60271"],
        basePerKg: { jneReg: 19000, jneYes: 34000, sicepatReg: 18500, jntEz: 18000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Malang",
        type: "Kota",
        postalCodes: ["65111", "65141"],
        basePerKg: { jneReg: 20000, jneYes: 35000, sicepatReg: 19500, jntEz: 19000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Sidoarjo",
        type: "Kabupaten",
        postalCodes: ["61211", "61254"],
        basePerKg: { jneReg: 19000, jneYes: 34000, sicepatReg: 18500, jntEz: 18000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Gresik",
        type: "Kabupaten",
        postalCodes: ["61111", "61122"],
        basePerKg: { jneReg: 19000, jneYes: 34000, sicepatReg: 18500, jntEz: 18000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Bali",
    cities: [
      {
        name: "Denpasar",
        type: "Kota",
        postalCodes: ["80111", "80234"],
        basePerKg: { jneReg: 23000, jneYes: 40000, sicepatReg: 22000, jntEz: 21000 },
        etdDays: "2-3 Hari"
      },
      {
        name: "Badung (Kuta/Seminyak)",
        type: "Kabupaten",
        postalCodes: ["80361", "80362"],
        basePerKg: { jneReg: 24000, jneYes: 42000, sicepatReg: 23000, jntEz: 22000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Sumatera Utara",
    cities: [
      {
        name: "Medan",
        type: "Kota",
        postalCodes: ["20111", "20152", "20211"],
        basePerKg: { jneReg: 35000, jneYes: 60000, sicepatReg: 34000, jntEz: 33000 },
        etdDays: "3-4 Hari"
      },
      {
        name: "Deli Serdang",
        type: "Kabupaten",
        postalCodes: ["20511", "20551"],
        basePerKg: { jneReg: 37000, sicepatReg: 36000, jntEz: 35000 },
        etdDays: "3-4 Hari"
      }
    ]
  },
  {
    province: "Sumatera Barat",
    cities: [
      {
        name: "Padang",
        type: "Kota",
        postalCodes: ["25111", "25133"],
        basePerKg: { jneReg: 34000, jneYes: 58000, sicepatReg: 33000, jntEz: 32000 },
        etdDays: "3-4 Hari"
      }
    ]
  },
  {
    province: "Sumatera Selatan",
    cities: [
      {
        name: "Palembang",
        type: "Kota",
        postalCodes: ["30111", "30139"],
        basePerKg: { jneReg: 24000, jneYes: 42000, sicepatReg: 23000, jntEz: 22000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Riau",
    cities: [
      {
        name: "Pekanbaru",
        type: "Kota",
        postalCodes: ["28111", "28282"],
        basePerKg: { jneReg: 32000, jneYes: 55000, sicepatReg: 31000, jntEz: 30000 },
        etdDays: "3-4 Hari"
      },
      {
        name: "Batam",
        type: "Kota",
        postalCodes: ["29411", "29432"],
        basePerKg: { jneReg: 30000, jneYes: 52000, sicepatReg: 29000, jntEz: 28000 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Lampung",
    cities: [
      {
        name: "Bandar Lampung",
        type: "Kota",
        postalCodes: ["35111", "35142"],
        basePerKg: { jneReg: 21000, jneYes: 38000, sicepatReg: 20000, jntEz: 19500 },
        etdDays: "2-3 Hari"
      }
    ]
  },
  {
    province: "Kalimantan Timur",
    cities: [
      {
        name: "Balikpapan",
        type: "Kota",
        postalCodes: ["76111", "76114"],
        basePerKg: { jneReg: 40000, jneYes: 70000, sicepatReg: 38000, jntEz: 37000 },
        etdDays: "3-4 Hari"
      },
      {
        name: "Samarinda",
        type: "Kota",
        postalCodes: ["75111", "75123"],
        basePerKg: { jneReg: 42000, sicepatReg: 40000, jntEz: 39000 },
        etdDays: "3-4 Hari"
      }
    ]
  },
  {
    province: "Kalimantan Selatan",
    cities: [
      {
        name: "Banjarmasin",
        type: "Kota",
        postalCodes: ["70111", "70231"],
        basePerKg: { jneReg: 38000, sicepatReg: 36000, jntEz: 35000 },
        etdDays: "3-4 Hari"
      }
    ]
  },
  {
    province: "Sulawesi Selatan",
    cities: [
      {
        name: "Makassar",
        type: "Kota",
        postalCodes: ["90111", "90222"],
        basePerKg: { jneReg: 42000, jneYes: 75000, sicepatReg: 40000, jntEz: 39000 },
        etdDays: "3-4 Hari"
      }
    ]
  },
  {
    province: "Papua",
    cities: [
      {
        name: "Jayapura",
        type: "Kota",
        postalCodes: ["99111", "99221"],
        basePerKg: { jneReg: 98000, sicepatReg: 95000, jntEz: 92000 },
        etdDays: "4-7 Hari"
      }
    ]
  }
];

export interface RealCourierRate {
  id: string;
  courier_name: string;
  courier_code: string;
  service_name: string;
  price: number;
  duration: string;
  icon: string;
  breakdown: string;
}

export function normalizeAddressSearch(input: string): string {
  return input
    .toLowerCase()
    .replace(/^kota\s+/i, "")
    .replace(/^kabupaten\s+/i, "")
    .replace(/^kab\.\s*/i, "")
    .replace(/dki\s*/i, "")
    .replace(/daerah istimewa\s*/i, "")
    .replace(/di\s*/i, "")
    .trim();
}

/**
 * Searches the logistics database for a matching province and city
 */
export function lookupDestination(provInput: string, cityInput: string) {
  if (!provInput.trim() && !cityInput.trim()) {
    return { found: false, cityObj: null, provinceObj: null, error: null };
  }

  const cleanProv = normalizeAddressSearch(provInput);
  const cleanCity = normalizeAddressSearch(cityInput);

  // 1. Try to find matching province
  const matchedProv = INDONESIA_SHIPPING_DATABASE.find(p => {
    const pClean = normalizeAddressSearch(p.province);
    return pClean.includes(cleanProv) || cleanProv.includes(pClean);
  });

  if (!matchedProv) {
    return {
      found: false,
      cityObj: null,
      provinceObj: null,
      error: `Provinsi "${provInput}" tidak ditemukan dalam sistem rute logistik.`
    };
  }

  // 2. Try to find matching city within that province or across all provinces
  let matchedCity = matchedProv.cities.find(c => {
    const cClean = normalizeAddressSearch(c.name);
    return cClean.includes(cleanCity) || cleanCity.includes(cClean);
  });

  // If not found in selected province, search other provinces to be helpful
  if (!matchedCity && cleanCity) {
    for (const prov of INDONESIA_SHIPPING_DATABASE) {
      const altCity = prov.cities.find(c => {
        const cClean = normalizeAddressSearch(c.name);
        return cClean.includes(cleanCity) || cleanCity.includes(cClean);
      });
      if (altCity) {
        return {
          found: true,
          cityObj: altCity,
          provinceObj: prov,
          switchedProvince: prov.province,
          error: null
        };
      }
    }
  }

  if (!matchedCity) {
    return {
      found: false,
      cityObj: null,
      provinceObj: matchedProv,
      error: `Kota/Kabupaten "${cityInput}" tidak ditemukan di wilayah provinsi ${matchedProv.province}.`
    };
  }

  return {
    found: true,
    cityObj: matchedCity,
    provinceObj: matchedProv,
    error: null
  };
}

/**
 * Calculates genuine Indonesian logistics rates based on real destination & actual package weight
 */
export function calculateRealShippingRates(
  provInput: string,
  cityInput: string,
  weightGrams: number
): { rates: RealCourierRate[]; error: string | null; destinationName?: string } {
  const result = lookupDestination(provInput, cityInput);

  if (!result.found || !result.cityObj) {
    return {
      rates: [],
      error: result.error || "Alamat pengiriman tidak ditemukan dalam jangkauan kurir logistik kami. Mohon periksa kembali penulisan Kota/Kabupaten dan Provinsi."
    };
  }

  const { cityObj, provinceObj } = result;
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
  const rates: RealCourierRate[] = [];

  // J&T Express EZ
  const jntPrice = cityObj.basePerKg.jntEz * weightKg;
  rates.push({
    id: "jnt-ez",
    courier_name: "J&T Express",
    courier_code: "jnt",
    service_name: "EZ (Reguler Express)",
    price: jntPrice,
    duration: cityObj.etdDays,
    icon: "⚡",
    breakdown: `Tarif ${cityObj.name}: Rp ${cityObj.basePerKg.jntEz.toLocaleString("id-ID")}/kg × ${weightKg} kg`
  });

  // SiCepat Reguler
  const sicepatPrice = cityObj.basePerKg.sicepatReg * weightKg;
  rates.push({
    id: "sicepat-reg",
    courier_name: "SiCepat",
    courier_code: "sicepat",
    service_name: "REG (Reguler Amanah)",
    price: sicepatPrice,
    duration: cityObj.etdDays,
    icon: "🍃",
    breakdown: `Tarif ${cityObj.name}: Rp ${cityObj.basePerKg.sicepatReg.toLocaleString("id-ID")}/kg × ${weightKg} kg`
  });

  // JNE Reguler
  const jnePrice = cityObj.basePerKg.jneReg * weightKg;
  rates.push({
    id: "jne-reg",
    courier_name: "JNE Express",
    courier_code: "jne",
    service_name: "REG (Layanan Reguler)",
    price: jnePrice,
    duration: cityObj.etdDays,
    icon: "📦",
    breakdown: `Tarif ${cityObj.name}: Rp ${cityObj.basePerKg.jneReg.toLocaleString("id-ID")}/kg × ${weightKg} kg`
  });

  // JNE YES (Yakin Esok Sampai) if available
  if (cityObj.basePerKg.jneYes) {
    const jneYesPrice = cityObj.basePerKg.jneYes * weightKg;
    rates.push({
      id: "jne-yes",
      courier_name: "JNE Express",
      courier_code: "jne",
      service_name: "YES (Yakin Esok Sampai - Kilat)",
      price: jneYesPrice,
      duration: "1 Hari Kerja (Garansi Besok Sampai)",
      icon: "🔥",
      breakdown: `Tarif YES Prioritas: Rp ${cityObj.basePerKg.jneYes.toLocaleString("id-ID")}/kg × ${weightKg} kg`
    });
  }

  // Instant courier for Jabodetabek if available
  if (cityObj.basePerKg.instant) {
    rates.push({
      id: "gosend-instant",
      courier_name: "GoSend / GrabExpress",
      courier_code: "gosend",
      service_name: "Instant Courier (Asuransi Penuh)",
      price: cityObj.basePerKg.instant,
      duration: "3-6 Jam Tiba",
      icon: "🛵",
      breakdown: `Tarif Flat Instant Kurir Dalam Kota: Rp ${cityObj.basePerKg.instant.toLocaleString("id-ID")}`
    });
  }

  return {
    rates,
    error: null,
    destinationName: `${cityObj.name}, ${provinceObj?.province}`
  };
}

export const POPULAR_DESTINATIONS = [
  {
    label: "Jakarta Selatan (Jabodetabek)",
    provinsi: "DKI Jakarta",
    kota: "Jakarta Selatan",
    kecamatan: "Mampang Prapatan",
    kelurahan: "Bangka",
    kodePos: "12730",
    alamat: "Jl. Kemang Raya No. 42B, Gedung Kemang Mansion Lantai 3"
  },
  {
    label: "Bandung (Jawa Barat)",
    provinsi: "Jawa Barat",
    kota: "Bandung",
    kecamatan: "Coblong",
    kelurahan: "Dago",
    kodePos: "40135",
    alamat: "Jl. Ir. H. Juanda No. 128, Ruko Dago Plaza"
  },
  {
    label: "Surabaya (Jawa Timur)",
    provinsi: "Jawa Timur",
    kota: "Surabaya",
    kecamatan: "Tegalsari",
    kelurahan: "Kedungdoro",
    kodePos: "60261",
    alamat: "Jl. Basuki Rahmat No. 88, Suite 501"
  },
  {
    label: "Medan (Sumatera Utara)",
    provinsi: "Sumatera Utara",
    kota: "Medan",
    kecamatan: "Medan Petisah",
    kelurahan: "Petisah Tengah",
    kodePos: "20112",
    alamat: "Jl. Gatot Subroto No. 65, Kompleks Boutique Mall"
  },
  {
    label: "Denpasar (Bali)",
    provinsi: "Bali",
    kota: "Denpasar",
    kecamatan: "Denpasar Selatan",
    kelurahan: "Sanur",
    kodePos: "80228",
    alamat: "Jl. Danau Tamblingan No. 19, Sanur Villa District"
  }
];
