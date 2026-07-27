import { useEffect, useState } from "react";

export default function ToastHost() {
  const [toast, setToast] = useState(null);

  useEffect(function() {
    function onToast(e) {
      setToast(e.detail);
      clearTimeout(window.__tennisToastTimer);
      window.__tennisToastTimer = setTimeout(function() {
        setToast(null);
      }, 4000);
    }
    window.addEventListener("tennisai-toast", onToast);
    return function() {
      window.removeEventListener("tennisai-toast", onToast);
    };
  }, []);

  if (!toast) return null;

  return (
    <div style={{
      position: "fixed",
      top: 16,
      left: 12,
      right: 12,
      zIndex: 9999,
      background: "#0f172a",
      border: "1px solid #18d96d",
      borderRadius: 14,
      padding: "12px 14px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.45)"
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#18d96d", marginBottom: 4 }}>{toast.title}</div>
      <div style={{ fontSize: 12, color: "#e2e8f0" }}>{toast.body}</div>
    </div>
  );
}
