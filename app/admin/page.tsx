"use client";

import { useEffect, useState } from "react";
import NetlifyAuthenticator from "netlify-auth-providers";

// TAHAP 1: hanya autentikasi. Tidak ada form/fitur tulis di sini.
// Token disimpan di localStorage — lihat penjelasan risiko yang
// menyertai perubahan ini.
const TOKEN_STORAGE_KEY = "admin_github_token";

type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
};

export default function AdminPage() {
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
    const authenticator = new NetlifyAuthenticator();
    authenticator.authenticate({ provider: "github", scope: "repo" }, (err, data) => {
      if (err || !data?.token) {
        setError(err ? err.toString() : "Login tidak mengembalikan token");
        return;
      }
      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
    });
  };

  const handleLogout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="display text-2xl">Admin</h1>

      {!token && (
        <>
          <p className="mt-3 max-w-[42ch] text-sm text-text-secondary">
            Login dengan akun GitHub yang punya akses ke repo ini.
          </p>
          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            Login with GitHub
          </button>
        </>
      )}

      {token && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {verifying && <p className="text-sm text-text-secondary">Memverifikasi token…</p>}

          {user && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full border border-border" />
              <p className="text-sm text-text-primary">
                Login sebagai <span className="font-medium">{user.name || user.login}</span>{" "}
                <span className="text-text-secondary">(@{user.login})</span>
              </p>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 rounded-full border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Logout
          </button>
        </div>
      )}

      {error && <p className="mt-4 max-w-[48ch] text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
