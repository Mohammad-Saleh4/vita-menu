"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

type QRCodeGeneratorProps = {
  slug: string;
};

export function QRCodeGenerator({ slug }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    setMenuUrl(`${window.location.origin}/${slug}`);
  }, [slug]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !menuUrl) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `${slug}-menu-qr.png`;
    link.click();
  }

  if (!menuUrl) return null;

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <QRCodeCanvas
          ref={canvasRef}
          value={menuUrl}
          size={256}
          level="M"
          includeMargin
        />
      </div>

      <div className="mt-6 w-full max-w-sm text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Menu URL
        </p>
        <p className="mt-1 break-all rounded-lg bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-800">
          {menuUrl}
        </p>
      </div>

      <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-zinc-600">
        Print this QR code and place it on your tables. Customers scan it with
        their phone camera to view the menu and order directly to your WhatsApp
        without downloading an app.
      </p>

      <button
        type="button"
        onClick={handleDownload}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
      >
        <Download className="h-4 w-4" />
        Download QR Code
      </button>
    </div>
  );
}
