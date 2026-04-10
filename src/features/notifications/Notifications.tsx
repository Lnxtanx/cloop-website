import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Bell, Star, Info, Trash2, CheckCheck, Loader2, BellOff } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
const token = () => localStorage.getItem("cloop_token") ?? "";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function fmtDate(str: string) {
  const d = new Date(str);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(str: string) {
  const d = new Date(str);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (r.ok) setNotifications(await r.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    }).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await fetch(`${API}/api/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
    }).catch(() => {});
  };

  const deleteNotif = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selected?.id === id) setSelected(null);
    await fetch(`${API}/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    }).catch(() => {});
  };

  const openNotif = (n: Notification) => {
    setSelected(n);
    if (!n.is_read) markRead(n.id);
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications">
      <div style={{ maxWidth: 720, margin: "0 auto" }} className="animate-fade-in">

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell style={{ width: 22, height: 22, color: "#7c3aed" }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1F2937", margin: 0 }}>Notifications</h2>
            {unread > 0 && (
              <span style={{
                background: "#EF4444", color: "#fff", fontSize: 11, fontWeight: 700,
                padding: "2px 8px", borderRadius: 20,
              }}>
                {unread} unread
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 10,
                border: "1.5px solid #7c3aed",
                background: "#fff", color: "#7c3aed",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <CheckCheck style={{ width: 15, height: 15 }} /> Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "#7c3aed" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0" }}>
            <BellOff style={{ width: 56, height: 56, color: "#D1D5DB" }} />
            <p style={{ fontWeight: 600, fontSize: 16, color: "#6B7280", marginTop: 16 }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => {
              const isWelcome = n.type === "welcome";
              const bg = n.is_read ? "#fff" : "#f3e8ff";
              return (
                <div key={n.id}
                  style={{
                    background: bg, borderRadius: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    display: "flex", alignItems: "flex-start",
                    border: n.is_read ? "1px solid #F3F4F6" : "1.5px solid #c4b5fd",
                    overflow: "hidden",
                  }}
                >
                  {/* Clickable area */}
                  <div
                    onClick={() => openNotif(n)}
                    style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 14, padding: 16, cursor: "pointer" }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: isWelcome ? "#FEF3C7" : "#ede9fe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isWelcome
                        ? <Star style={{ width: 20, height: 20, color: "#F59E0B" }} />
                        : <Info style={{ width: 20, height: 20, color: "#7c3aed" }} />
                      }
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <p style={{
                          fontWeight: n.is_read ? 600 : 800,
                          fontSize: 14, color: "#1F2937", margin: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {n.title}
                        </p>
                        <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>{fmtDate(n.created_at)}</span>
                      </div>
                      <p style={{
                        fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {n.message}
                      </p>
                      {n.message.length > 100 && (
                        <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>Read more...</span>
                      )}
                      {!n.is_read && (
                        <span style={{
                          display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                          background: "#EF4444", marginTop: 6,
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    style={{
                      padding: "16px 14px", background: "transparent", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center",
                    }}
                  >
                    <Trash2 style={{ width: 17, height: 17, color: "#EF4444" }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "#1F2937" }}>Notification</p>
              <button onClick={() => setSelected(null)} style={{
                width: 32, height: 32, borderRadius: "50%", background: "#F3F4F6",
                border: "none", cursor: "pointer", fontSize: 18, color: "#6B7280",
              }}>×</button>
            </div>

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: selected.type === "welcome" ? "#FEF3C7" : "#ede9fe",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected.type === "welcome"
                  ? <Star style={{ width: 28, height: 28, color: "#F59E0B" }} />
                  : <Info style={{ width: 28, height: 28, color: "#7c3aed" }} />
                }
              </div>
            </div>

            <p style={{ fontWeight: 700, fontSize: 18, color: "#1F2937", textAlign: "center", marginBottom: 6 }}>{selected.title}</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginBottom: 16 }}>{fmtDateTime(selected.created_at)}</p>
            <div style={{ height: 1, background: "#E5E7EB", marginBottom: 16 }} />
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: 0 }}>{selected.message}</p>

            <button
              onClick={() => setSelected(null)}
              style={{
                width: "100%", marginTop: 24,
                background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: 12, padding: "14px 0",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
