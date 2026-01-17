import React, { useState } from "react";
import SearchOverlay from "../SearchOverlay/SearchOverlay";
import { FiSearch } from "react-icons/fi";

const SearchHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header>
        {/* Your existing header content */}
        <button onClick={() => setSearchOpen(true)}>
          <FiSearch /> Search
        </button>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
export default SearchHeader;
