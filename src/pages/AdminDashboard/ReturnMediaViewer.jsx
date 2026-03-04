// src/components/admin/ReturnMediaViewer.jsx
//
// Standalone admin component for viewing return requests + Cloudinary evidence.
// Drop into your admin panel. Fetches GET /api/admin/returns (or /api/orders/returns).
// Media items are Cloudinary URLs stored in order_returns.media JSONB column.

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  RotateCcw,
  Image,
  Film,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Download,
  Eye,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => "₦" + Number(n || 0).toLocaleString();
const fmtDate = (d) =>
  !d
    ? "—"
    : new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    Icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    Icon: XCircle,
  },
  completed: {
    label: "Completed",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
    Icon: CheckCircle2,
  },
};

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: m.color,
        background: m.bg,
      }}
    >
      <m.Icon size={11} />
      {m.label}
    </span>
  );
}

// ── Media thumbnail grid ──────────────────────────────────────────────────────
function MediaGrid({ media, onOpen }) {
  if (!media || media.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.1)",
          textAlign: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 13,
        }}
      >
        No evidence uploaded
      </div>
    );
  }

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
    >
      {media.map((item, i) => (
        <button
          key={i}
          onClick={() => onOpen(i)}
          style={{
            position: "relative",
            aspectRatio: "1",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#0f0f14",
            cursor: "pointer",
            padding: 0,
            transition: "transform 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.borderColor = "#6366f1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          {item.type === "video" ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "#1a1a2e",
              }}
            >
              {/* Cloudinary video thumbnail via so_0 transformation */}
              <img
                src={item.url.replace(
                  "/upload/",
                  "/upload/so_0,w_200,h_200,c_fill/",
                )}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.6,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.45)",
                }}
              >
                <Film size={22} color="#fff" />
              </div>
            </div>
          ) : (
            <>
              <img
                src={item.url}
                alt={item.filename || `Evidence ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0)";
                }}
              >
                <ZoomIn size={20} color="#fff" style={{ opacity: 0 }} />
              </div>
            </>
          )}

          {/* File type badge */}
          <div
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              background: "rgba(0,0,0,0.7)",
              borderRadius: 4,
              padding: "2px 5px",
              fontSize: 10,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {item.type === "video" ? <Film size={9} /> : <Image size={9} />}
            {item.type}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ media, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const item = media[current];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCurrent((c) => (c - 1 + media.length) % media.length);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % media.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [media.length]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {item.type === "video" ? (
            <Film size={16} color="#fff" />
          ) : (
            <Image size={16} color="#fff" />
          )}
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
            {item.filename || `${item.type} ${current + 1}`}
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            {(item.size / 1024).toFixed(0)} KB
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <ExternalLink size={13} /> Open original
          </a>
          <a
            href={item.url + "?fl_attachment"}
            download={item.filename}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 6,
              background: "rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              textDecoration: "none",
              fontSize: 13,
              border: "1px solid rgba(99,102,241,0.4)",
            }}
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Media */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "min(90vw, 900px)", width: "100%" }}
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            controls
            autoPlay
            style={{
              width: "100%",
              maxHeight: "72vh",
              borderRadius: 10,
              background: "#000",
            }}
          />
        ) : (
          <img
            src={item.url}
            alt={item.filename}
            style={{
              width: "100%",
              maxHeight: "72vh",
              objectFit: "contain",
              borderRadius: 10,
            }}
          />
        )}
      </div>

      {/* Nav */}
      {media.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            onClick={() =>
              setCurrent((c) => (c - 1 + media.length) % media.length)
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  background:
                    i === current ? "#6366f1" : "rgba(255,255,255,0.3)",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => (c + 1) % media.length)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Return row detail panel ───────────────────────────────────────────────────
function ReturnDetail({ ret, onClose, onUpdateStatus, headers }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState(ret.admin_note || "");
  const media = Array.isArray(ret.media) ? ret.media : [];

  const handleStatus = async (action) => {
    // action is already "approve" | "reject" | "complete"
    setUpdating(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/returns/${ret.id}`, // ← no /status
        { action, admin_note: adminNote },
        { headers },
      );
      // Map action → display status
      const nextStatus = {
        approve: "approved",
        reject: "rejected",
        complete: "completed",
      }[action];
      onUpdateStatus(ret.id, nextStatus, adminNote);
    } catch (e) {
      alert(
        "Failed to update status: " + (e.response?.data?.message || e.message),
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(500px, 100vw)",
          zIndex: 101,
          background: "#13131a",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#13131a",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw size={16} color="#818cf8" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f1f5f9",
                }}
              >
                Return #{ret.id.slice(0, 8)}…
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {fmtDate(ret.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#94a3b8",
              cursor: "pointer",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Status + refund */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {[
              { label: "Status", value: <StatusPill status={ret.status} /> },
              {
                label: "Refund Amount",
                value: (
                  <span style={{ color: "#10b981", fontWeight: 700 }}>
                    {fmt(ret.refund_amount)}
                  </span>
                ),
              },
              { label: "Reason", value: ret.reason?.replace(/_/g, " ") },
              {
                label: "Refund Method",
                value: ret.refund_method?.replace(/_/g, " "),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#e2e8f0",
                    textTransform: "capitalize",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Customer note */}
          {ret.details && (
            <div
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 11,
                  color: "#f59e0b",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Customer's note
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#fde68a",
                  lineHeight: 1.5,
                }}
              >
                {ret.details}
              </p>
            </div>
          )}

          {/* ── Evidence media ── */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Evidence ({media.length} file{media.length !== 1 ? "s" : ""})
              </p>
              {media.length > 0 && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  Click to enlarge
                </span>
              )}
            </div>
            <MediaGrid media={media} onOpen={setLightboxIdx} />
          </div>

          {/* Admin note */}
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 13,
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Admin note
            </p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note visible to the customer…"
              rows={3}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 14,
                padding: "10px 12px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Actions */}
          {ret.status === "pending" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleStatus("approved")}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(16,185,129,0.15)",
                  color: "#34d399",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                onClick={() => handleStatus("rejected")}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          )}
          {ret.status === "approved" && (
            <button
              onClick={() => handleStatus("completed")}
              disabled={updating}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: "rgba(99,102,241,0.15)",
                color: "#a5b4fc",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <CheckCircle2 size={15} /> Mark as Completed
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          media={media}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ReturnMediaViewer() {
  const { accessToken } = useAuthStore();
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/returns`, {
        headers,
        params: {
          page,
          limit: 15,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      const data = res.data;
      setReturns(data.returns || data.data || []);
      setTotalPages(data.pagination?.pages || 1);

      // Compute stats from results if API doesn't return them
      if (data.stats) {
        setStats(data.stats);
      } else {
        const all = data.returns || data.data || [];
        setStats({
          pending: all.filter((r) => r.status === "pending").length,
          approved: all.filter((r) => r.status === "approved").length,
          rejected: all.filter((r) => r.status === "rejected").length,
          completed: all.filter((r) => r.status === "completed").length,
        });
      }
    } catch (e) {
      console.error("Failed to fetch returns:", e.message);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleUpdateStatus = (id, newStatus, adminNote) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus, admin_note: adminNote } : r,
      ),
    );
    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: newStatus, admin_note: adminNote }
        : prev,
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d12",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
              }}
            >
              <RotateCcw size={20} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f1f5f9",
                }}
              >
                Return Requests
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Review evidence & manage refunds
              </p>
            </div>
          </div>
          <button
            onClick={fetchReturns}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {Object.entries(STATUS_META).map(([key, m]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(statusFilter === key ? "" : key);
                setPage(1);
              }}
              style={{
                background:
                  statusFilter === key ? m.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${statusFilter === key ? m.color + "50" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10,
                padding: "14px 16px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 12,
                  color: m.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                {m.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#f1f5f9",
                }}
              >
                {stats[key] || 0}
              </p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "0 12px",
            }}
          >
            <Search
              size={14}
              style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order ID or reason…"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                fontSize: 14,
                padding: "10px 0",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#94a3b8",
              fontSize: 13,
              padding: "0 14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <RefreshCw
              size={24}
              style={{ animation: "spin 1s linear infinite", marginBottom: 12 }}
            />
            <p style={{ margin: 0, fontSize: 14 }}>Loading returns…</p>
          </div>
        ) : returns.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              borderRadius: 12,
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <RotateCcw size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
              }}
            >
              No return requests found
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Table head */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 100px 90px 90px 60px",
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              <span>Order / Reason</span>
              <span>Amount</span>
              <span>Refund to</span>
              <span>Status</span>
              <span>Date</span>
              <span>Media</span>
            </div>

            {returns.map((ret, i) => {
              const media = Array.isArray(ret.media) ? ret.media : [];
              return (
                <div
                  key={ret.id}
                  onClick={() => setSelected(ret)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 90px 90px 60px",
                    padding: "14px 20px",
                    cursor: "pointer",
                    borderBottom:
                      i < returns.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                    transition: "background 0.1s",
                    background:
                      selected?.id === ret.id
                        ? "rgba(99,102,241,0.08)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selected?.id !== ret.id)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.id !== ret.id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Order + reason */}
                  <div>
                    <p
                      style={{
                        margin: "0 0 3px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e2e8f0",
                      }}
                    >
                      #{ret.order_id?.slice(0, 8)}…
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "capitalize",
                      }}
                    >
                      {ret.reason?.replace(/_/g, " ")}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#10b981",
                      alignSelf: "center",
                    }}
                  >
                    {fmt(ret.refund_amount)}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "capitalize",
                      alignSelf: "center",
                    }}
                  >
                    {ret.refund_method?.replace(/_/g, " ")}
                  </span>

                  <div style={{ alignSelf: "center" }}>
                    <StatusPill status={ret.status} />
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      alignSelf: "center",
                    }}
                  >
                    {fmtDate(ret.created_at)}
                  </span>

                  {/* Media count badge */}
                  <div
                    style={{
                      alignSelf: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {media.length > 0 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(99,102,241,0.15)",
                          border: "1px solid rgba(99,102,241,0.3)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#a5b4fc",
                        }}
                      >
                        <Image size={10} />
                        {media.length}
                      </span>
                    ) : (
                      <span
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}
                      >
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 20,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: page === 1 ? "rgba(255,255,255,0.2)" : "#94a3b8",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color:
                  page === totalPages ? "rgba(255,255,255,0.2)" : "#94a3b8",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ReturnDetail
          ret={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={handleUpdateStatus}
          headers={headers}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
