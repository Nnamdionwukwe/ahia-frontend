// src/pages/Orders/ReturnDetails.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, Copy } from "lucide-react";
import styles from "./ReturnDetails.module.css";

const formatCurrency = (v) => `₦${Number(v || 0).toLocaleString("en-NG")}`;
const formatDate = (d, short = false) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(
    "en-NG",
    short
      ? { month: "short", day: "numeric", year: "numeric" }
      : {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
  );
};

const DEMO = {
  id: "RET-00000001",
  order_id: "PO-147-017979868659830946-D01",
  status: "completed",
  refund_amount: 98837,
  refund_method: "original_payment",
  details:
    "Refund requested by customer service for you has been issued for 1 return item.",
  created_at: "2025-11-24T09:48:00Z",
  resolved_at: "2025-12-01T10:00:00Z",
  estimated_from: "2025-12-02",
  estimated_to: "2025-12-03",
  items: [
    {
      name: "Portable Monitor 15.6 Inch 1080P USB...",
      sku: "PM1561",
      quantity: 1,
      image: null,
    },
  ],
};

const ReturnDetails = ({ returnData: propReturn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data =
    propReturn || location.state?.returnData || location.state?.return || DEMO;

  const estFrom = data.estimated_from
    ? new Date(data.estimated_from).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      })
    : "Dec 2";
  const estTo = data.estimated_to
    ? new Date(data.estimated_to).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      })
    : "Dec 3";

  const handleCopyId = () =>
    navigator.clipboard?.writeText(data.order_id || data.id);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.headerTitle}>Return details</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.body}>
        {/* Hero */}
        <div className={styles.hero}>
          <p className={styles.heroText}>
            Your refund has been issued to your financial institution for them
            to process it. You should receive the refund by:
          </p>
          <div className={styles.heroRow}>
            <span className={styles.heroDates}>
              {estFrom}–{estTo}
            </span>
            <span className={styles.heroSep} />
            <span className={styles.heroAmountWrap}>
              <span className={styles.heroMethodDot}>💳</span>
              <span className={styles.heroAmount}>
                {formatCurrency(data.refund_amount)}
              </span>
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className={styles.ctaBlock}>
          <button className={styles.btnOrange}>Track your refund</button>
          <button className={styles.btnOutline}>
            View proof of refund sent
          </button>
          <button className={styles.btnOutline}>
            View details of the {formatCurrency(data.refund_amount)} of refund
          </button>
        </div>

        {/* Timeline card */}
        <div className={styles.card}>
          <div className={styles.timeline}>
            <div className={styles.tlNode}>
              <div className={styles.tlLogoWrap}>
                <div className={styles.tlStoreLogo}>
                  <span>TM</span>
                </div>
                <span className={styles.tlCheck}>
                  <CheckCircle2 size={15} color="#27ae60" />
                </span>
              </div>
              <p className={styles.tlNodeLabel}>Temu issued refund</p>
              <p className={styles.tlNodeDate}>
                {formatDate(data.resolved_at, true)}
              </p>
            </div>

            <div className={styles.tlMiddle}>
              <span className={styles.tlArrowLabel}>Refunded to</span>
              <div className={styles.tlArrowLine}>
                <div className={styles.tlArrowHead} />
              </div>
            </div>

            <div className={styles.tlNode}>
              <div className={styles.tlMethodRing}>
                <span>💳</span>
              </div>
              <p className={styles.tlNodeLabel}>Must be processed by</p>
              <p className={styles.tlNodeLabel}>your financial institution</p>
            </div>
          </div>
        </div>

        {/* Refund description */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Refund description</h2>
          <p className={styles.sectionBody}>{data.details}</p>
        </div>

        <div className={styles.sectionDivider} />

        {/* Refund amount and proof */}
        <div className={styles.section}>
          <div className={styles.sectionHeadRow}>
            <h2 className={styles.sectionTitle}>Refund amount and proof</h2>
            <button className={styles.viewDetailsBtn}>
              View details <ChevronRight size={14} />
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.amountRow}>
              <div className={styles.methodChip}>
                <span className={styles.methodChipIcon}>💳</span>
                <span className={styles.methodChipLabel}>
                  {data.refund_method === "bank_transfer"
                    ? "Bank Transfer"
                    : data.refund_method === "store_credit"
                      ? "Store Credit"
                      : "Opay"}
                </span>
              </div>
              <span className={styles.amountBig}>
                {formatCurrency(data.refund_amount)}
              </span>
            </div>

            <div className={styles.cardDivider} />

            <button className={styles.linkRow}>
              <span className={styles.linkRowIcon}>🧾</span>
              <span className={styles.linkRowLabelOrange}>
                View proof of refund sent
              </span>
              <ChevronRight size={15} color="#e65100" />
            </button>

            <div className={styles.cardDivider} />

            <button className={styles.linkRow}>
              <span className={styles.linkRowLabel}>Track your refund</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className={styles.sectionDivider} />

        {/* Item requested to return */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Item requested to return</h2>

          {(data.items || []).map((item, i) => (
            <div key={i} className={styles.itemCard}>
              <div className={styles.itemImgWrap}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImg}
                  />
                ) : (
                  <div className={styles.itemImgPlaceholder}>📦</div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                <div className={styles.itemMeta}>
                  <span className={styles.itemSku}>{item.sku || "—"}</span>
                  <span className={styles.itemQty}>x{item.quantity || 1}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Meta rows */}
          <div className={styles.metaBlock}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Refund status:</span>
              <span className={styles.metaValue}>
                {data.items?.length || 1} item refunded
              </span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Return ID:</span>
              <span className={styles.metaValueRight}>
                <span className={styles.metaId}>
                  {data.order_id || data.id}
                </span>
                <button className={styles.copyPill} onClick={handleCopyId}>
                  Copy
                </button>
              </span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Request time:</span>
              <span className={styles.metaValue}>
                {formatDate(data.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Have questions? Read our{" "}
            <button className={styles.footerLink}>Return/Refund Policy</button>{" "}
            or{" "}
            <button className={styles.footerLink}>
              Contact Customer Service
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;
