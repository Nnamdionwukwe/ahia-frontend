// components/CategoryHeader/CategoryHeader.jsx
import PromoBanner from "../CategoryPage/PromoBanner";
import SearchHeader from "../SearchHeader/SearchHeader";
import styles from "./CategoryHeader.module.css";

const CategoryHeader = ({ promoItems, onBannerClick }) => {
  return (
    <header className={styles.header}>
      <SearchHeader />
      <PromoBanner
        items={promoItems}
        showArrow={true}
        onBannerClick={onBannerClick}
        sticky={true}
      />
    </header>
  );
};

export default CategoryHeader;
