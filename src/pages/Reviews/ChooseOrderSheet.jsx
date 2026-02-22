import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./ChooseOrderSheet.module.css";

// Mock orders data — replace with real API
const MOCK_ORDERS = [
  {
    id: "ord_1",
    deliveredDate: "Dec 5, 2025",
    items: [
      { id: 1, image: "https://via.placeholder.com/80/b0b8c1/333?text=LED" },
    ],
  },
  {
    id: "ord_2",
    deliveredDate: "Dec 2, 2025",
    items: [
      { id: 2, image: "https://via.placeholder.com/80/111/fff?text=KB" },
      { id: 3, image: "https://via.placeholder.com/80/6c5ce7/fff?text=Stand" },
      { id: 4, image: "https://via.placeholder.com/80/2d3436/fff?text=Pad" },
      { id: 5, image: "https://via.placeholder.com/80/4a4a4a/fff?text=Bag" },
      { id: 6, image: "https://via.placeholder.com/80/333/fff?text=+" },
      { id: 7, image: "https://via.placeholder.com/80/555/fff?text=+" },
      { id: 8, image: "https://via.placeholder.com/80/666/fff?text=+" },
      { id: 9, image: "https://via.placeholder.com/80/777/fff?text=+" },
      { id: 10, image: "https://via.placeholder.com/80/888/fff?text=+" },
      { id: 11, image: "https://via.placeholder.com/80/999/fff?text=+" },
      { id: 12, image: "https://via.placeholder.com/80/aaa/fff?text=+" },
      { id: 13, image: "https://via.placeholder.com/80/bbb/333?text=+" },
    ],
  },
  {
    id: "ord_3",
    deliveredDate: "Nov 27, 2025",
    items: [
      { id: 14, image: "https://via.placeholder.com/80/333/fff?text=Lens" },
      { id: 15, image: "https://via.placeholder.com/80/c8a96e/fff?text=Cloth" },
      { id: 16, image: "https://via.placeholder.com/80/d0d0d0/333?text=Bulb" },
      { id: 17, image: "https://via.placeholder.com/80/222/fff?text=Mic" },
      { id: 18, image: "https://via.placeholder.com/80/444/fff?text=+" },
      { id: 19, image: "https://via.placeholder.com/80/555/fff?text=+" },
      { id: 20, image: "https://via.placeholder.com/80/666/fff?text=+" },
    ],
  },
  {
    id: "ord_4",
    deliveredDate: "Nov 24, 2025",
    items: [
      { id: 21, image: "https://via.placeholder.com/80/ccc/333?text=Hub" },
    ],
  },
];

const MAX_VISIBLE = 4;

function OrderRow({ order, onSelect }) {
  const visible = order.items.slice(0, MAX_VISIBLE);
  const extra = order.items.length - MAX_VISIBLE;

  return (
    <div className={styles.orderRow} onClick={() => onSelect(order)}>
      <div className={styles.orderContent}>
        <p className={styles.deliveredDate}>
          Delivered on {order.deliveredDate}
        </p>
        <div className={styles.imagesRow}>
          {visible.map((item, i) => (
            <div key={item.id} className={styles.thumbWrap}>
              <img
                src={item.image}
                alt=""
                className={styles.thumb}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80?text=IMG";
                }}
              />
              {/* Show +N overlay on the last visible if there are extras */}
              {i === MAX_VISIBLE - 1 && extra > 0 && (
                <div className={styles.extraOverlay}>+{extra}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ChevronRight size={20} className={styles.chevron} />
    </div>
  );
}

export default function ChooseOrderSheet({ onClose }) {
  const navigate = useNavigate();

  const handleSelect = (order) => {
    onClose();
    navigate("/leave-all-reviews", { state: { order } });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className={styles.handle} />

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Choose an order to review all items of it
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Orders list */}
        <div className={styles.list}>
          {MOCK_ORDERS.map((order, i) => (
            <React.Fragment key={order.id}>
              <OrderRow order={order} onSelect={handleSelect} />
              {i < MOCK_ORDERS.length - 1 && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
