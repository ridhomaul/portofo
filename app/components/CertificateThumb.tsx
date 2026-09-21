"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type CertificateThumbProps = {
  image: string;
  title: string;
};

/**
 * <dialog> native menangani Esc dan focus trap sendiri saat showModal().
 * Kunci scroll <html> lewat event "close" bawaan supaya tertutup lewat
 * Esc, klik backdrop, atau tombol X tetap konsisten mengembalikannya.
 */
export default function CertificateThumb({ image, title }: CertificateThumbProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const unlockScroll = () => {
      document.documentElement.style.overflow = "";
    };

    dialog.addEventListener("close", unlockScroll);
    return () => {
      dialog.removeEventListener("close", unlockScroll);
      unlockScroll();
    };
  }, []);

  const openDialog = () => {
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.showModal();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Tidak ada wrapper penuh di dalam dialog, jadi klik di area kosong
    // (bukan gambar/tombol X) selalu bertarget elemen <dialog> itu sendiri.
    if (e.target === e.currentTarget) {
      dialogRef.current?.close();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`Lihat sertifikat ${title}`}
        className="mt-3 block w-fit transition-opacity hover:opacity-80"
      >
        <Image
          src={image}
          alt={`${title} certificate`}
          width={96}
          height={64}
          className="rounded-md border border-border object-cover"
        />
      </button>

      <dialog ref={dialogRef} onClick={handleDialogClick} className="cert-dialog">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-white transition-opacity hover:opacity-80"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Ukuran gambar sertifikat tidak seragam, jadi <img> polos +
            object-contain lebih pas daripada next/image yang minta
            width/height tetap. eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${title} certificate`} className="cert-dialog-image" />
      </dialog>

      <style jsx>{`
        .cert-dialog {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          margin: 0;
          padding: 0;
          border: none;
          background: transparent;
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }
        .cert-dialog[open] {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transform: scale(1);
        }
        @starting-style {
          .cert-dialog[open] {
            opacity: 0;
            transform: scale(0.96);
          }
        }
        .cert-dialog::backdrop {
          background: rgb(0 0 0 / 0.75);
        }
        .cert-dialog-image {
          max-width: min(90vw, 960px);
          max-height: 85vh;
          object-fit: contain;
          border-radius: 0.75rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .cert-dialog {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
