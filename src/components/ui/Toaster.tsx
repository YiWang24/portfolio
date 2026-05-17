"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: { fontFamily: "var(--font-plex-mono), monospace" },
      }}
    />
  );
}
