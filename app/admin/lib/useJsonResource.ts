import { useCallback, useEffect, useState } from "react";
import { SaveConflictError, fetchJsonFile, saveJsonFile } from "./github";

// Satu file JSON di repo (mis. content/data/projects.json), dibaca
// sekali per token lalu ditulis lewat save(). Dibuat SEKALI per file
// di shell (app/admin/page.tsx) dan dibagi ke semua panel yang
// mengedit file yang sama (mis. Projects, Featured, Case study semua
// memakai projects.json) — supaya semuanya berbagi satu `sha` dan
// tidak saling memicu 409 karena panel lain menulis duluan.
export function useJsonResource<T>(token: string | null, path: string) {
  const [data, setData] = useState<T | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setConflict(false);

    fetchJsonFile<T>(token, path)
      .then(({ data, sha }) => {
        setData(data);
        setSha(sha);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, path]);

  useEffect(() => {
    if (!token) {
      setData(null);
      setSha(null);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, path]);

  // true = tersimpan. false = ditolak karena konflik (409) — `conflict`
  // sudah diset, tampilkan ConflictBanner. Error lain (jaringan, dst)
  // dilempar ke pemanggil supaya tiap panel bisa menampilkan pesannya
  // sendiri di dekat form yang relevan.
  const save = useCallback(
    async (next: T, message: string): Promise<boolean> => {
      if (!token || !sha) return false;
      try {
        const newSha = await saveJsonFile(token, path, next, sha, message);
        setData(next);
        setSha(newSha);
        return true;
      } catch (err) {
        if (err instanceof SaveConflictError) {
          setConflict(true);
          return false;
        }
        throw err;
      }
    },
    [token, sha, path]
  );

  const reloadAfterConflict = useCallback(() => {
    setConflict(false);
    load();
  }, [load]);

  return { data, loading, error, conflict, save, load, reloadAfterConflict };
}
