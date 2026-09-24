"use client";

import { useEffect, useState } from "react";
import NetlifyAuthenticator from "netlify-auth-providers";
import type { Certification } from "@/content/certifications";
import { GITHUB_BRANCH, GITHUB_REPO } from "./github-config";

const CERTIFICATIONS_PATH = "content/data/certifications.json";

// TAHAP 1: hanya autentikasi. Tidak ada form/fitur tulis di sini.
// Token disimpan di localStorage — lihat penjelasan risiko yang
// menyertai perubahan ini.
const TOKEN_STORAGE_KEY = "admin_github_token";

// Site ID Netlify (bukan domain) — sama di production maupun semua
// branch/deploy preview, jadi aman dipakai di mana pun tanpa deteksi
// host. Wajib: netlify-auth-providers meng-crash di constructor kalau
// dipanggil tanpa argumen sama sekali (lihat catatan di handleLogin).
const NETLIFY_SITE_ID = "34b7bd30-0f88-4ed0-8a48-ab34383e7724";

type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
};

type GithubContentsResponse = {
  content: string;
  encoding: string;
  sha: string;
};

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TAHAP 2: baca saja. `certificationsSha` wajib disimpan sekarang —
  // dibutuhkan sebagai `sha` saat menulis (PUT) di tahap 3, GitHub
  // menolak update tanpa sha terbaru dari file yang sama.
  const [certifications, setCertifications] = useState<Certification[] | null>(null);
  const [certificationsSha, setCertificationsSha] = useState<string | null>(null);
  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [certificationsError, setCertificationsError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!token) {
      setCertifications(null);
      setCertificationsSha(null);
      return;
    }

    let cancelled = false;
    setCertificationsLoading(true);
    setCertificationsError(null);

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CERTIFICATIONS_PATH}?ref=${GITHUB_BRANCH}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`GET contents/${CERTIFICATIONS_PATH} -> HTTP ${res.status}`);
        }
        return (await res.json()) as GithubContentsResponse;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.encoding !== "base64") {
          throw new Error(`Encoding tak terduga dari GitHub API: ${data.encoding}`);
        }
        const text = decodeBase64Utf8(data.content);
        const parsed = JSON.parse(text) as { certifications: Certification[] };
        setCertifications(parsed.certifications);
        setCertificationsSha(data.sha);
      })
      .catch((err) => {
        if (!cancelled) {
          setCertificationsError(err instanceof Error ? err.message : "Gagal memuat data sertifikat");
        }
      })
      .finally(() => {
        if (!cancelled) setCertificationsLoading(false);
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

  if (!hydrated) {
    return null;
  }

  return (
    <div className="pb-20 pt-16">
      <div className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
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

      {token && (
        <div className="mx-auto mt-8 max-w-3xl px-6 text-left">
          <h2 className="text-lg font-medium">Certifications</h2>

          {certificationsLoading && (
            <p className="mt-4 text-sm text-text-secondary">Memuat sertifikat…</p>
          )}

          {!certificationsLoading && certificationsError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{certificationsError}</p>
          )}

          {!certificationsLoading && !certificationsError && certifications && certifications.length === 0 && (
            <p className="mt-4 text-sm text-text-secondary">Belum ada sertifikat.</p>
          )}

          {!certificationsLoading && !certificationsError && certifications && certifications.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-(--radius) border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Issuer</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert, i) => (
                    <tr key={`${cert.title}-${i}`} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-text-secondary">{cert.date}</td>
                      <td className="px-4 py-3 text-text-primary">{cert.title}</td>
                      <td className="px-4 py-3 text-text-secondary">{cert.issuer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
