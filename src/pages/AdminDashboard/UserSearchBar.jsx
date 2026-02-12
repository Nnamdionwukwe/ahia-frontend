import React from "react";
import { Search } from "lucide-react";
import styles from "./UserSearchBar.module.css";

const UserSearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className={styles.searchBar}>
      <Search size={20} />
      <input
        type="text"
        placeholder="Search users by name, email, or phone..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default UserSearchBar;
