// Satu-satunya tempat nama repo, branch, dan semua panggilan GitHub
// Contents API didefinisikan. Dipakai bersama oleh semua panel admin
// lewat useJsonResource (baca/tulis file JSON) dan uploadImage
// (gambar) — jangan menulis ulang logika fetch di tiap panel.
export const GITHUB_OWNER = "ridhomaul";
export const GITHUB_REPO_NAME = "portofo";
export const GITHUB_REPO = `${GITHUB_OWNER}/${GITHUB_REPO_NAME}`;
export const GITHUB_BRANCH = "admin-dashboard";

export type GithubUser = {
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

// Sha sudah tidak cocok dengan isi file terbaru di repo (ada
// perubahan lain sejak terakhir dimuat) — GitHub menolak dengan 409.
export class SaveConflictError extends Error {}

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

export async function fetchJsonFile<T>(token: string, path: string): Promise<{ data: T; sha: string }> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`GET contents/${path} -> HTTP ${res.status}`);
  }
  const body = (await res.json()) as GithubContentsGetResponse;
  if (body.encoding !== "base64") {
    throw new Error(`Encoding tak terduga dari GitHub API: ${body.encoding}`);
  }
  const text = decodeBase64Utf8(body.content);
  return { data: JSON.parse(text) as T, sha: body.sha };
}

export async function saveJsonFile<T>(
  token: string,
  path: string,
  data: T,
  sha: string,
  message: string
): Promise<string> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const body = JSON.stringify(data, null, 2) + "\n";

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
    throw new Error(`PUT contents/${path} -> HTTP ${res.status}`);
  }

  const responseData = (await res.json()) as GithubContentsPutResponse;
  return responseData.content.sha;
}

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Nama file dari slug judul, huruf kecil semua, tanpa spasi — server
// Linux membedakan huruf besar-kecil, jadi ini harus konsisten. Semua
// karakter selain a-z0-9 (termasuk tanda kutip, slash, titik dua,
// tanda tanya, dst — apa pun yang tidak valid di nama file) diganti
// "-", run tanda hubung berturut-turut dirapikan jadi satu, dan
// tanda hubung di awal/akhir dipotong. Kalau judul tidak punya huruf
// atau angka apa pun (mis. cuma tanda baca atau aksara non-Latin),
// hasilnya bisa string kosong — fallback ke "file" supaya tidak
// pernah menghasilkan nama file yang cuma berisi ekstensi (".png").
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "file";
}

export function getFileExtension(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string; // "data:<mime>;base64,<data>"
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });
}

// null berarti file belum ada di repo (404) -> boleh dibuat tanpa sha.
// Error lain (403, jaringan, dst) dilempar apa adanya.
export async function getExistingFileSha(token: string, path: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GET contents/${path} -> HTTP ${res.status}`);
  }
  const data = (await res.json()) as GithubContentsGetResponse;
  return data.sha;
}

export async function uploadImage(token: string, file: File, path: string, message: string): Promise<void> {
  const existingSha = await getExistingFileSha(token, path);
  const base64 = await fileToBase64(file);

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: base64,
      branch: GITHUB_BRANCH,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`PUT contents/${path} -> HTTP ${res.status}`);
  }
}
