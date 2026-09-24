import { useEffect, useState } from "react";
import NetlifyAuthenticator from "netlify-auth-providers";
import type { GithubUser } from "./github";

// TAHAP 1: autentikasi. Token disimpan di localStorage — lihat
// penjelasan risiko yang menyertai perubahan itu.
const TOKEN_STORAGE_KEY = "admin_github_token";

// Site ID Netlify (bukan domain) — sama di production maupun semua
// branch/deploy preview, jadi aman dipakai di mana pun tanpa deteksi
// host. Wajib: netlify-auth-providers meng-crash di constructor kalau
// dipanggil tanpa argumen sama sekali (lihat catatan di handleLogin).
const NETLIFY_SITE_ID = "34b7bd30-0f88-4ed0-8a48-ab34383e7724";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage tidak ada saat prerender static export, jadi baru
  // dibaca setelah mount di browser.
  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_STORAGE_KEY));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;
    setVerifying(true);
    setError(null);

    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Token invalid/dicabut — hapus supaya kembali ke layar login.
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            if (!cancelled) setToken(null);
          }
          throw new Error(`GET /user -> HTTP ${res.status}`);
        }
        return (await res.json()) as GithubUser;
      })
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memverifikasi token");
        }
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleLogin = () => {
    setError(null);
    try {
      // netlify-auth-providers' constructor does `this.site_id =
      // config.site_id` with no default for `config`, so calling
      // `new NetlifyAuthenticator()` with zero arguments throws
      // synchronously ("Cannot read properties of undefined (reading
      // 'site_id')") before its own host-based auto-detection ever
      // runs — that logic lives inside authenticate(), never reached.
      // Passing site_id explicitly avoids the crash and works
      // identically on every URL this site is served from.
      const authenticator = new NetlifyAuthenticator({ site_id: NETLIFY_SITE_ID });
      authenticator.authenticate({ provider: "github", scope: "repo" }, (err, data) => {
        if (err || !data?.token) {
          setError(err ? err.toString() : "Login tidak mengembalikan token");
          return;
        }
        window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setToken(data.token);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai proses login");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return { token, hydrated, user, verifying, error, handleLogin, handleLogout };
}
