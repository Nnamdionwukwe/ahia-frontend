import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Activity, Package, ShoppingBag } from "lucide-react";
import styles from "./AdminDashboard.module.css";
import useAuthStore from "../../store/authStore";
import ChartsRow from "./ChartsRow";
import PopularProducts from "./PopularProducts";
import UserStats from "./UserStats";
import UserSearchBar from "./UserSearchBar";
import UsersTable from "./UsersTable";
import AdminHeader from "./AdminHeader";
import NavigationTabs from "./NavigationTabs";
import TabContent from "./TabContent";
import UserDetailsModal from "./UserDetailsModal";
import ProductsManagement from "./ProductsManagement"; // NEW
import OrdersManagement from "./OrdersManagement"; // NEW
import FlashSalesManagement from "./FlashSalesManagement";
import SeasonalSalesManagement from "./SeasonalSalesManagement";
import NotificationsManagement from "./NotificationsManagement";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AdminDashboard = () => {
  const { accessToken, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [platformMetrics, setPlatformMetrics] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [dauData, setDauData] = useState([]);

  // Users State
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === "overview") {
      fetchPlatformAnalytics();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, period]);

  const fetchPlatformAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/analytics/platform`, {
        params: { period },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPlatformMetrics(response.data.metrics);
      setPopularProducts(response.data.popularProducts || []);
      setPopularSearches(response.data.popularSearches || []);
      setDauData(response.data.dauOverTime || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        params: { page: 1, limit: 100, search: searchQuery },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUsers(response.data.users || []);
      setUserStats(response.data.stats || null);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );
  };

  const handleUserDeleted = (deletedUserId) => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== deletedUserId),
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || "0";
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statTitle}>{title}</p>
        <h3 className={styles.statValue}>{value}</h3>
        {change && (
          <span
            className={`${styles.statChange} ${change > 0 ? styles.positive : styles.negative}`}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className={styles.overviewContainer}>
      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          title="Active Users"
          value={formatNumber(platformMetrics?.active_users)}
          change={12}
          color="#4f46e5"
        />
        <StatCard
          icon={Activity}
          title="Total Sessions"
          value={formatNumber(platformMetrics?.total_sessions)}
          change={8}
          color="#06b6d4"
        />
        <StatCard
          icon={Package}
          title="Products Viewed"
          value={formatNumber(platformMetrics?.products_viewed)}
          change={15}
          color="#8b5cf6"
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Purchases"
          value={formatNumber(platformMetrics?.total_purchases)}
          change={-3}
          color="#10b981"
        />
      </div>
      <ChartsRow dauData={dauData} popularSearches={popularSearches} />
      <PopularProducts
        popularProducts={popularProducts}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />
    </div>
  );

  const UsersTab = () => {
    const filteredUsers = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.includes(searchQuery) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className={styles.usersContainer}>
        <UserStats users={users} />
        <UserSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <UsersTable
          filteredUsers={filteredUsers}
          setSelectedUser={setSelectedUser}
        />
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      <AdminHeader user={user} period={period} setPeriod={setPeriod} />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabContent loading={loading} activeTab={activeTab}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "products" && <ProductsManagement />}
        {activeTab === "orders" && <OrdersManagement />}
        {activeTab === "flash-sales" && <FlashSalesManagement />}
        {activeTab === "seasonal-sales" && <SeasonalSalesManagement />}
        {activeTab === "notifications" && <NotificationsManagement />}
      </TabContent>

      {selectedUser && (
        <UserDetailsModal
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
