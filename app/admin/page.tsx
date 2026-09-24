"use client";

import { useCallback, useEffect, useState } from "react";
import NetlifyAuthenticator from "netlify-auth-providers";
import type { Certification } from "@/content/certifications";
import { GITHUB_BRANCH, GITHUB_REPO } from "./github-config";

const CERTIFICATIONS_PATH = "content/data/certifications.json";

// TAHAP 1: autentikasi. Token disimpan di localStorage — lihat
// penjelasan risiko yang menyertai perubahan itu.
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

// Bentuk respons GET Contents API: sha ada di root.
type GithubContentsGetResponse = {
  content: string;
  encoding: string;
  sha: string;
};

// Bentuk respons PUT Contents API: sha file yang baru ada di
// content.sha, BUKAN di root seperti respons GET — beda struktur,
// jangan disamakan.
type GithubContentsPutResponse = {
  content: { sha: string };
};

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeUtf8Base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

async function fetchCertificationsFile(
  token: string
): Promise<{ certifications: Certification[]; sha: string }> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CERTIFICATIONS_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`GET contents/${CERTIFICATIONS_PATH} -> HTTP ${res.status}`);
  }
  const data = (await res.json()) as GithubContentsGetResponse;
  if (data.encoding !== "base64") {
    throw new Error(`Encoding tak terduga dari GitHub API: ${data.encoding}`);
  }
  const text = decodeBase64Utf8(data.content);
  const parsed = JSON.parse(text) as { certifications: Certification[] };
  return { certifications: parsed.certifications, sha: data.sha };
}

// Sha sudah tidak cocok dengan isi file terbaru di repo (ada
// perubahan lain sejak terakhir dimuat) — GitHub menolak dengan 409.
class SaveConflictError extends Error {}

async function saveCertificationsFile(
  token: string,
  certifications: Certification[],
  sha: string,
  message: string
): Promise<string> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CERTIFICATIONS_PATH}`;
  const body = JSON.stringify({ certifications }, null, 2) + "\n";

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: encodeUtf8Base64(body),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new SaveConflictError();
    }
    throw new Error(`PUT contents/${CERTIFICATIONS_PATH} -> HTTP ${res.status}`);
  }

  const data = (await res.json()) as GithubContentsPutResponse;
  return data.content.sha;
}

type CertificationForm = {
  date: string;
  title: string;
  issuer: string;
  credentialId: string;
  url: string;
};

const EMPTY_FORM: CertificationForm = { date: "", title: "", issuer: "", credentialId: "", url: "" };

// `base` (kalau ada, saat edit) dipertahankan supaya field yang tidak
// dikelola form ini — mis. `image`, kalau entri itu sudah punya —
// tidak ikut hilang.
function buildCertificationFromForm(form: CertificationForm, base?: Certification): Certification {
  const result: Certification = {
    ...base,
    date: form.date.trim(),
    title: form.title.trim(),
    issuer: form.issuer.trim(),
  };

  const credentialId = form.credentialId.trim();
  if (credentialId) {
    result.credentialId = credentialId;
  } else {
    delete result.credentialId;
  }

  const url = form.url.trim();
  if (url) {
    result.url = url;
  } else {
    delete result.url;
  }

  return result;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TAHAP 2: baca. `certificationsSha` dipakai sebagai `sha` saat
  // menulis (PUT) di tahap 3 — GitHub menolak update tanpa sha
  // terbaru dari file yang sama.
  const [certifications, setCertifications] = useState<Certification[] | null>(null);
  const [certificationsSha, setCertificationsSha] = useState<string | null>(null);
  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [certificationsError, setCertificationsError] = useState<string | null>(null);

  // TAHAP 3: tulis (tambah/edit/hapus).
  const [form, setForm] = useState<CertificationForm>(EMPTY_FORM);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [conflict, setConflict] = useState(false);

  const busy = saving || deletingIndex !== null;

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

  const loadCertifications = useCallback(() => {
    if (!token) return;
    setCertificationsLoading(true);
    setCertificationsError(null);
    setConflict(false);

    fetchCertificationsFile(token)
      .then(({ certifications, sha }) => {
        setCertifications(certifications);
        setCertificationsSha(sha);
      })
      .catch((err) => {
        setCertificationsError(err instanceof Error ? err.message : "Gagal memuat data sertifikat");
      })
      .finally(() => {
        setCertificationsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setCertifications(null);
      setCertificationsSha(null);
      return;
    }
    loadCertifications();
  }, [token, loadCertifications]);

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

  const handleEditClick = (index: number) => {
    const cert = certifications?.[index];
    if (!cert) return;
    setEditingIndex(index);
    setForm({
      date: cert.date,
      title: cert.title,
      issuer: cert.issuer,
      credentialId: cert.credentialId ?? "",
      url: cert.url ?? "",
    });
    setFormError(null);
    setSaveStatus(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!form.date.trim() || !form.title.trim() || !form.issuer.trim()) {
      setFormError("Date, title, dan issuer wajib diisi.");
      return;
    }

    if (!token || !certifications || !certificationsSha) {
      setFormError("Data sertifikat belum siap — coba muat ulang.");
      return;
    }

    const isEditing = editingIndex !== null;
    const base = isEditing ? certifications[editingIndex] : undefined;
    const entry = buildCertificationFromForm(form, base);

    const nextList = isEditing
      ? certifications.map((c, i) => (i === editingIndex ? entry : c))
      : [...certifications, entry];

    const message = isEditing
      ? `admin: perbarui sertifikat ${entry.title}`
      : `admin: tambah sertifikat ${entry.title}`;

    setSaving(true);
    try {
      const newSha = await saveCertificationsFile(token, nextList, certificationsSha, message);
      setCertifications(nextList);
      setCertificationsSha(newSha);
      setSaveStatus({ type: "success", message: isEditing ? "Sertifikat diperbarui." : "Sertifikat ditambahkan." });
      setForm(EMPTY_FORM);
      setEditingIndex(null);
    } catch (err) {
      if (err instanceof SaveConflictError) {
        setConflict(true);
      } else {
        setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!certifications) return;
    const target = certifications[index];
    const confirmed = window.confirm(
      `Hapus sertifikat "${target.title}"? Ini langsung commit ke repo dan tidak bisa dibatalkan dari sini.`
    );
    if (!confirmed) return;

    if (!token || !certificationsSha) {
      setSaveStatus({ type: "error", message: "Data sertifikat belum siap — coba muat ulang." });
      return;
    }

    const nextList = certifications.filter((_, i) => i !== index);
    const message = `admin: hapus sertifikat ${target.title}`;

    setDeletingIndex(index);
    setSaveStatus(null);
    try {
      const newSha = await saveCertificationsFile(token, nextList, certificationsSha, message);
      setCertifications(nextList);
      setCertificationsSha(newSha);
      setSaveStatus({ type: "success", message: "Sertifikat dihapus." });
      if (editingIndex === index) {
        setEditingIndex(null);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      if (err instanceof SaveConflictError) {
        setConflict(true);
      } else {
        setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menghapus." });
      }
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleReloadAfterConflict = () => {
    setConflict(false);
    setEditingIndex(null);
    setForm(EMPTY_FORM);
    loadCertifications();
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

          {certificationsLoading && <p className="mt-4 text-sm text-text-secondary">Memuat sertifikat…</p>}

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
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert, i) => (
                    <tr key={`${cert.title}-${i}`} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-text-secondary">{cert.date}</td>
                      <td className="px-4 py-3 text-text-primary">{cert.title}</td>
                      <td className="px-4 py-3 text-text-secondary">{cert.issuer}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditClick(i)}
                          disabled={busy}
                          className="text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(i)}
                          disabled={busy}
                          className="ml-3 text-xs text-red-600 transition-opacity hover:opacity-70 disabled:opacity-50 dark:text-red-400"
                        >
                          {deletingIndex === i ? "Menghapus…" : "Hapus"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {conflict && (
            <div className="mt-4 rounded-(--radius) border border-border bg-black/5 p-4 text-sm dark:bg-white/8">
              <p className="text-text-primary">
                Data di repo sudah berubah sejak terakhir dimuat, jadi simpanan ini ditolak supaya tidak menimpa
                perubahan itu.
              </p>
              <button
                type="button"
                onClick={handleReloadAfterConflict}
                className="mt-3 rounded-full border border-border px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                Muat ulang data
              </button>
            </div>
          )}

          {certifications && (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-(--radius) border border-dashed border-border p-6">
              <h3 className="text-sm font-medium text-text-primary">
                {editingIndex !== null ? "Edit sertifikat" : "Tambah sertifikat"}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-text-secondary">Date</span>
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="Contoh: Mar 2026"
                    className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-text-secondary">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-text-secondary">Issuer</span>
                  <input
                    type="text"
                    value={form.issuer}
                    onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                    className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-text-secondary">Credential ID (opsional)</span>
                  <input
                    type="text"
                    value={form.credentialId}
                    onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                    className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                  <span className="text-text-secondary">Verification URL (opsional)</span>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
                  />
                </label>
              </div>

              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan…"
                    : editingIndex !== null
                      ? "Simpan perubahan"
                      : "Tambah sertifikat"}
                </button>

                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={busy}
                    className="rounded-full border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                  >
                    Batal
                  </button>
                )}
              </div>

              {saveStatus && (
                <p
                  className={`text-sm ${
                    saveStatus.type === "success" ? "text-text-primary" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {saveStatus.message}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
