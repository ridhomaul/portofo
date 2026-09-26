import { useCallback, useEffect, useRef, useState } from "react";

// Menyimpan pratinjau lokal (object URL) dari file yang baru saja
// diupload di sesi ini, dikunci oleh path final di repo (mis.
// "/certificates/foo.png"). Situs statis baru benar-benar menyajikan
// file itu setelah Netlify selesai rebuild (1-3 menit) — sebelum itu,
// path repo akan gagal dimuat walau datanya sudah benar tersimpan.
// Dibuat sekali di shell (page.tsx) dan dibagi ke semua panel yang
// punya upload gambar, supaya pratinjau tidak hilang saat pindah tab.
export function useRecentUploads() {
  const [map, setMap] = useState<Record<string, string>>({});
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    return () => {
      Object.values(mapRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const remember = useCallback((path: string, file: File) => {
    setMap((prev) => {
      const existing = prev[path];
      if (existing) URL.revokeObjectURL(existing);
      return { ...prev, [path]: URL.createObjectURL(file) };
    });
  }, []);

  const get = useCallback((path?: string | null) => (path ? map[path] : undefined), [map]);

  return { get, remember };
}

export type RecentUploads = ReturnType<typeof useRecentUploads>;
