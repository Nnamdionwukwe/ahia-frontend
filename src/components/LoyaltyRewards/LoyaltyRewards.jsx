import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trophy,
  Gift,
  History,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Share2,
  Copy,
  Check,
  Lock,
  Sparkles,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import styles from "./LoyaltyRewards.module.css";
import useAuthStore from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const LoyaltyRewards = () => {
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, rewards, history, referral

  // Account State
  const [account, setAccount] = useState(null);
  const [expiringPoints, setExpiringPoints] = useState(0);

  // Rewards State
  const [availableRewards, setAvailableRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);

  // Transaction History State
  const [transactions, setTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  // Referral State
  const [referralCode, setReferralCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLoyaltyAccount();
    fetchAvailableRewards();
    fetchUserRewards();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransactionHistory();
    } else if (activeTab === "referral") {
      fetchReferralCode();
    }
  }, [activeTab, transactionFilter, pagination.page]);

  const fetchLoyaltyAccount = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/loyalty/account`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAccount(response.data.account);
      setExpiringPoints(response.data.expiringPoints);
    } catch (error) {
      console.error("Failed to fetch loyalty account:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRewards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/loyalty/rewards`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAvailableRewards(response.data.rewards);
    } catch (error) {
      console.error("Failed to fetch available rewards:", error);
    }
  };

  const fetchUserRewards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/loyalty/user-rewards`, {
        params: { status: "active" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUserRewards(response.data.rewards);
    } catch (error) {
      console.error("Failed to fetch user rewards:", error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/loyalty/transactions`, {
        params: {
          page: pagination.page,
          limit: 20,
          type: transactionFilter !== "all" ? transactionFilter : undefined,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/loyalty/referral`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReferralCode(response.data.referralCode);
    } catch (error) {
      console.error("Failed to fetch referral code:", error);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    if (!window.confirm("Redeem this reward?")) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/loyalty/redeem/${rewardId}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      alert(`✅ Reward redeemed! Your code: ${response.data.userReward.code}`);

      // Refresh data
      fetchLoyaltyAccount();
      fetchAvailableRewards();
      fetchUserRewards();
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert(error.response?.data?.error || "❌ Failed to redeem reward");
    }
  };

  const copyReferralCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyRewardCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: "#cd7f32",
      silver: "#c0c0c0",
      gold: "#ffd700",
      platinum: "#e5e4e2",
    };
    return colors[tier?.toLowerCase()] || colors.bronze;
  };

  const getTierGradient = (tier) => {
    const gradients = {
      bronze: "linear-gradient(135deg, #cd7f32, #b87333)",
      silver: "linear-gradient(135deg, #c0c0c0, #a8a8a8)",
      gold: "linear-gradient(135deg, #ffd700, #ffed4e)",
      platinum: "linear-gradient(135deg, #e5e4e2, #b9b9b9)",
    };
    return gradients[tier?.toLowerCase()] || gradients.bronze;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your rewards...</p>
        </div>
      </div>
    );
  }

  // Overview Tab
  const OverviewTab = () => (
    <div className={styles.overviewContainer}>
      {/* Tier Card */}
      <div
        className={styles.tierCard}
        style={{ background: getTierGradient(account?.tier) }}
      >
        <div className={styles.tierHeader}>
          <div className={styles.tierBadge}>
            <Trophy size={32} />
            <div>
              <h2>{account?.tier} Member</h2>
              <p>{account?.tierMultiplier}x Points Multiplier</p>
            </div>
          </div>
          <div className={styles.pointsBalance}>
            <p>Your Points</p>
            <h1>{account?.points_balance?.toLocaleString() || 0}</h1>
          </div>
        </div>

        {account?.nextTier && (
          <div className={styles.tierProgress}>
            <div className={styles.progressInfo}>
              <span>Progress to {account.nextTier}</span>
              <span>
                {account.pointsToNextTier?.toLocaleString()} points to go
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(100, ((account.lifetime_points % 5000) / 5000) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Star size={24} />
          <div>
            <p>Lifetime Points</p>
            <h3>{account?.lifetime_points?.toLocaleString() || 0}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <Clock size={24} />
          <div>
            <p>Expiring Soon</p>
            <h3 className={styles.expiringPoints}>
              {expiringPoints?.toLocaleString() || 0}
            </h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <Gift size={24} />
          <div>
            <p>Active Rewards</p>
            <h3>{userRewards?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Ways to Earn */}
      <div className={styles.waysToEarn}>
        <h3>Ways to Earn Points</h3>
        <div className={styles.earnGrid}>
          <div className={styles.earnCard}>
            <div className={styles.earnIcon}>🛍️</div>
            <h4>Make Purchases</h4>
            <p>10 points per ₦1 spent</p>
          </div>
          <div className={styles.earnCard}>
            <div className={styles.earnIcon}>⭐</div>
            <h4>Write Reviews</h4>
            <p>50 points per review</p>
          </div>
          <div className={styles.earnCard}>
            <div className={styles.earnIcon}>👥</div>
            <h4>Refer Friends</h4>
            <p>500 points per referral</p>
          </div>
          <div className={styles.earnCard}>
            <div className={styles.earnIcon}>📱</div>
            <h4>Share Products</h4>
            <p>20 points per share</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Rewards Tab
  const RewardsTab = () => (
    <div className={styles.rewardsContainer}>
      <div className={styles.sectionHeader}>
        <h3>Available Rewards</h3>
        <p>Redeem your points for exclusive rewards</p>
      </div>

      <div className={styles.rewardsGrid}>
        {availableRewards.map((reward) => (
          <div
            key={reward.id}
            className={`${styles.rewardCard} ${!reward.can_afford ? styles.locked : ""}`}
          >
            <div className={styles.rewardHeader}>
              {reward.reward_type === "discount_percentage" && (
                <Tag size={24} />
              )}
              {reward.reward_type === "discount_fixed" && <Gift size={24} />}
              {reward.reward_type === "free_shipping" && <Package size={24} />}
            </div>

            <h4>{reward.title}</h4>
            <p className={styles.rewardDescription}>{reward.description}</p>

            <div className={styles.rewardValue}>
              {reward.reward_type === "discount_percentage" && (
                <span className={styles.badge}>{reward.value}% OFF</span>
              )}
              {reward.reward_type === "discount_fixed" && (
                <span className={styles.badge}>₦{reward.value} OFF</span>
              )}
              {reward.reward_type === "free_shipping" && (
                <span className={styles.badge}>FREE SHIPPING</span>
              )}
            </div>

            <div className={styles.rewardFooter}>
              <div className={styles.pointsCost}>
                <Star size={16} />
                <span>{reward.points_cost.toLocaleString()} points</span>
              </div>

              {reward.stock_quantity !== null && (
                <span className={styles.stock}>
                  {reward.stock_quantity} left
                </span>
              )}
            </div>

            <button
              className={styles.redeemButton}
              onClick={() => handleRedeemReward(reward.id)}
              disabled={!reward.can_afford}
            >
              {reward.can_afford ? (
                <>
                  <Sparkles size={18} />
                  Redeem Now
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Need{" "}
                  {(
                    reward.points_cost - account.points_balance
                  ).toLocaleString()}{" "}
                  more
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* User's Active Rewards */}
      {userRewards.length > 0 && (
        <div className={styles.activeRewardsSection}>
          <h3>Your Active Rewards</h3>
          <div className={styles.activeRewardsList}>
            {userRewards.map((reward) => (
              <div key={reward.id} className={styles.activeRewardCard}>
                <div className={styles.activeRewardInfo}>
                  <h4>{reward.title}</h4>
                  <p>{reward.description}</p>
                  <div className={styles.rewardCode}>
                    <code>{reward.code}</code>
                    <button onClick={() => copyRewardCode(reward.code)}>
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.activeRewardMeta}>
                  <span className={styles.validUntil}>
                    Valid until {formatDate(reward.valid_until)}
                  </span>
                  {reward.reward_type === "discount_percentage" && (
                    <span className={styles.value}>{reward.value}% OFF</span>
                  )}
                  {reward.reward_type === "discount_fixed" && (
                    <span className={styles.value}>₦{reward.value} OFF</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // History Tab
  const HistoryTab = () => (
    <div className={styles.historyContainer}>
      <div className={styles.historyHeader}>
        <h3>Transaction History</h3>
        <select
          value={transactionFilter}
          onChange={(e) => setTransactionFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Transactions</option>
          <option value="earn">Points Earned</option>
          <option value="redeem">Points Redeemed</option>
        </select>
      </div>

      <div className={styles.transactionsList}>
        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={48} />
            <p>No transactions yet</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className={styles.transactionCard}>
              <div className={styles.transactionIcon}>
                {transaction.transaction_type === "earn" ? (
                  <TrendingUp size={20} className={styles.earnIcon} />
                ) : (
                  <Gift size={20} className={styles.redeemIcon} />
                )}
              </div>

              <div className={styles.transactionInfo}>
                <h4>{transaction.description}</h4>
                <p className={styles.transactionDate}>
                  {formatDateTime(transaction.created_at)}
                </p>
                {transaction.order_number && (
                  <span className={styles.orderNumber}>
                    Order #{transaction.order_number}
                  </span>
                )}
                {transaction.reward_title && (
                  <span className={styles.rewardTitle}>
                    {transaction.reward_title}
                  </span>
                )}
              </div>

              <div className={styles.transactionAmount}>
                <span
                  className={
                    transaction.transaction_type === "earn"
                      ? styles.positive
                      : styles.negative
                  }
                >
                  {transaction.transaction_type === "earn" ? "+" : ""}
                  {transaction.points_amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Referral Tab
  const ReferralTab = () => (
    <div className={styles.referralContainer}>
      <div className={styles.referralCard}>
        <div className={styles.referralHeader}>
          <Share2 size={32} />
          <div>
            <h3>Refer Friends, Earn Points!</h3>
            <p>Get 500 points for each friend who makes a purchase</p>
          </div>
        </div>

        {referralCode && (
          <div className={styles.referralCodeBox}>
            <label>Your Referral Code</label>
            <div className={styles.codeDisplay}>
              <code>{referralCode.code}</code>
              <button onClick={copyReferralCode} className={styles.copyButton}>
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <div className={styles.referralStats}>
          <div className={styles.referralStat}>
            <h4>{referralCode?.referrals_count || 0}</h4>
            <p>Total Referrals</p>
          </div>
          <div className={styles.referralStat}>
            <h4>{referralCode?.successful_referrals || 0}</h4>
            <p>Successful</p>
          </div>
          <div className={styles.referralStat}>
            <h4>{(referralCode?.successful_referrals || 0) * 500}</h4>
            <p>Points Earned</p>
          </div>
        </div>

        <div className={styles.referralInstructions}>
          <h4>How it works:</h4>
          <ol>
            <li>Share your referral code with friends</li>
            <li>They sign up and make their first purchase</li>
            <li>You both get 500 points! 🎉</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Award size={32} />
          <div>
            <h1>Loyalty & Rewards</h1>
            <p>Earn points with every purchase and unlock exclusive rewards</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Trophy size={18} />
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === "rewards" ? styles.active : ""}`}
          onClick={() => setActiveTab("rewards")}
        >
          <Gift size={18} />
          Rewards
        </button>
        <button
          className={`${styles.tab} ${activeTab === "history" ? styles.active : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={18} />
          History
        </button>
        <button
          className={`${styles.tab} ${activeTab === "referral" ? styles.active : ""}`}
          onClick={() => setActiveTab("referral")}
        >
          <Share2 size={18} />
          Refer & Earn
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "rewards" && <RewardsTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "referral" && <ReferralTab />}
      </div>
    </div>
  );
};

export default LoyaltyRewards;
