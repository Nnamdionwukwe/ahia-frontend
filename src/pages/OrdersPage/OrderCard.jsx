// src/pages/Orders/OrderCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  MoreHorizontal,
  AlertCircle,
  Building2,
} from "lucide-react";
import styles from "./OrderCard.module.css";

export function getOrderStatus(order) {
  if (order.payment_status === "refunded") return "refunded";
  if (order.payment_status === "pending") return "payment_processing";
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered") return "delivered";
  if (order.status === "shipped") return "shipped";
  if (order.status === "processing") return "processing";
  return "pending";
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return `₦${Number(amount).toLocaleString()}`;
}

const OrderCard = ({
  order,
  showMenu,
  setShowMenu,
  onCancelClick,
  onBuyAgainClick,
  onChangePaymentClick,
}) => {
  const navigate = useNavigate();
  const status = getOrderStatus(order);
  const isPaymentProcessing = status === "payment_processing";
  const isRefunded = status === "refunded";

  return (
    <div className={styles.orderCard}>
      {/* Order Header */}
      <div className={styles.orderHeader}>
        {status === "delivered" && (
          <p className={styles.deliveryDate}>
            Delivered on {formatDate(order.delivered_at || order.updated_at)}
          </p>
        )}
        {isPaymentProcessing && (
          <div className={styles.statusBadge}>
            <Clock size={16} />
            <span>Payment processing</span>
          </div>
        )}
        {isRefunded && <p className={styles.refundedText}>Refunded</p>}
      </div>

      {/* Order Items Preview */}
      <div
        className={styles.orderItems}
        onClick={() => {
          const id = order._id || order.id;
          if (id) {
            navigate(`/orders/${id}`);
          } else {
            console.error("Order ID is missing:", order);
            alert("Unable to view order details");
          }
        }}
      >
        <div className={styles.itemsPreview}>
          {order.items?.slice(0, 6).map((item, index) => (
            <div key={index} className={styles.itemImage}>
              <img
                src={item.images?.[0] || item.image || "/placeholder.png"}
                alt={item.name || "Product"}
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              {item.quantity > 1 && (
                <span className={styles.quantityBadge}>x{item.quantity}</span>
              )}
            </div>
          ))}
          {order.items && order.items.length > 6 && (
            <div className={styles.moreItems}>+{order.items.length - 6}</div>
          )}
        </div>
        <div className={styles.orderSummary}>
          <p className={styles.orderTotal}>
            {formatCurrency(order.total_amount)}
          </p>
          <p className={styles.itemCount}>
            {order.item_count || order.items?.length || 0} items
          </p>
        </div>
        <ChevronRight size={20} className={styles.chevron} />
      </div>

      {/* Refund Information */}
      {isRefunded && (
        <div className={styles.refundInfo}>
          <div className={styles.refundHeader}>
            <AlertCircle size={18} />
            <p>
              Refund issued by Temu for the cancelled items. It needs to be
              processed by your financial institution
            </p>
          </div>
          <p className={styles.refundDescription}>
            We've issued your refund for the entire order of {order.item_count}{" "}
            items that you have requested to cancel.
          </p>

          <div className={styles.refundDetails}>
            <div className={styles.refundRow}>
              <span>Total refund amount:</span>
              <strong>{formatCurrency(order.total_amount)}</strong>
            </div>

            <div className={styles.paymentMethod}>
              <Building2 size={24} className={styles.paymentLogo} />
              <span>Opay</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>

            <button className={styles.proofLink}>
              View proof of refund sent by Temu →
            </button>

            <div className={styles.refundDate}>
              <p>The date refund will be issued by financial institution:</p>
              <p className={styles.dateHighlight}>
                {formatDate(order.refund_date || order.updated_at)}
              </p>
            </div>

            <button className={styles.trackButton}>Track</button>
          </div>

          <p className={styles.requestedDate}>
            Requested on {formatDate(order.created_at)}
          </p>
        </div>
      )}

      {/* Payment Processing Info */}
      {isPaymentProcessing && (
        <div className={styles.paymentProcessing}>
          <Clock size={18} className={styles.processingIcon} />
          <div className={styles.processingText}>
            <p>
              We've reserved your order.{" "}
              <span className={styles.highlight}>If you haven't paid</span> with{" "}
              {order.payment_method}, you can change your payment method to{" "}
              <span className={styles.paymentIcons}>💳 💰 🍎</span> or another
              payment method to{" "}
              <span className={styles.highlight}>
                receive your items faster.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.moreButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(
              showMenu === (order._id || order.id)
                ? null
                : order._id || order.id,
            );
          }}
        >
          <MoreHorizontal size={20} />
        </button>

        {showMenu === (order._id || order.id) && (
          <div className={styles.menuDropdown}>
            {status === "payment_processing" && (
              <>
                <button
                  onClick={() => {
                    setShowMenu(null);
                    navigate(`/orders/${order._id || order.id}/edit-address`);
                  }}
                >
                  Change address
                </button>
                <button onClick={() => onBuyAgainClick(order)}>
                  Buy this again
                </button>
              </>
            )}
            {(status === "delivered" || status === "refunded") && (
              <button onClick={() => onBuyAgainClick(order)}>
                Buy this again
              </button>
            )}
            <button
              onClick={() => {
                setShowMenu(null);
                navigate(`/orders/${order._id || order.id}`);
              }}
            >
              View details
            </button>
            <button
              onClick={() => {
                setShowMenu(null);
                navigate(`/support?order_id=${order._id || order.id}`);
              }}
            >
              Contact support
            </button>
            {(status === "pending" || status === "payment_processing") && (
              <button onClick={() => onCancelClick(order)}>Cancel order</button>
            )}
          </div>
        )}

        {status === "delivered" && (
          <>
            <button className={styles.secondaryButton}>Return/Refund</button>
            <button className={styles.secondaryButton}>Buy this again</button>
            <button className={styles.primaryButton}>Leave a review</button>
          </>
        )}

        {status === "refunded" && (
          <>
            <button className={styles.secondaryButton}>Refund details</button>
            <button className={styles.secondaryButton}>Buy this again</button>
          </>
        )}

        {isPaymentProcessing && (
          <>
            <button
              className={styles.secondaryButton}
              onClick={() => onCancelClick(order)}
            >
              Cancel order
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => onChangePaymentClick(order)}
            >
              Change payment method
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
