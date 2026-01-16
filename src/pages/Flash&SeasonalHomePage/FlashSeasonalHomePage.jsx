import React, { useState, useEffect } from "react";
import {
  Clock,
  Flame,
  TrendingUp,
  Tag,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FlashSaleCard = ({ product, saleEndTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(saleEndTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [saleEndTime]);

  const remainingQty = product.remaining_quantity || 0;
  const maxQty = product.max_quantity || 1;
  const soldQty = product.sold_quantity || 0;
  const soldPercentage = maxQty > 0 ? Math.round((soldQty / maxQty) * 100) : 0;
  const savings =
    (product.original_price || product.price) - product.sale_price;
  const savingsPercent = Math.round(
    (savings / (product.original_price || product.price)) * 100
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300x300?text=Product"
          }
          alt={product.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Flame size={16} />-{savingsPercent}%
        </div>
        {remainingQty < 10 && remainingQty > 0 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Only {remainingQty} left!
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="fill-yellow-400 text-yellow-400" size={16} />
          <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-red-600">
            ₦{product.sale_price?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ₦{(product.original_price || product.price)?.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Sold: {soldPercentage}%</span>
            <span>{remainingQty} left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <Clock size={16} className="text-red-500" />
            <div className="flex gap-1 text-sm font-mono font-bold">
              <span className="bg-gray-800 text-white px-2 py-1 rounded">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-gray-800 text-white px-2 py-1 rounded">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-gray-800 text-white px-2 py-1 rounded">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
          Buy Now
        </button>
      </div>
    </div>
  );
};

const UpcomingSaleCard = ({ sale }) => {
  const [timeUntil, setTimeUntil] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(sale.start_time).getTime();
      const distance = start - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeUntil({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sale.start_time]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {sale.name || sale.title}
          </h3>
          <p className="text-sm text-gray-600">{sale.description}</p>
        </div>
        <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          -{sale.discount_percentage}%
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Days", value: timeUntil.days },
          { label: "Hours", value: timeUntil.hours },
          { label: "Mins", value: timeUntil.minutes },
          { label: "Secs", value: timeUntil.seconds },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg p-2 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{sale.product_count || 0} products</span>
        <button className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
          View Details <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const SeasonalSaleCard = ({ product, sale }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(sale.end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sale.end_time]);

  const savings = product.price - product.sale_price;
  const savingsPercent = Math.round((savings / product.price) * 100);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300x300?text=Product"
          }
          alt={product.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {sale.season} Sale -{savingsPercent}%
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="fill-yellow-400 text-yellow-400" size={16} />
          <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-green-600">
            ₦{product.sale_price?.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ₦{product.price?.toLocaleString()}
          </span>
        </div>

        {timeLeft.days > 0 && (
          <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg mb-3 text-center font-semibold">
            Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </div>
        )}

        <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const FlashSeasonalHomePage = () => {
  const [activeFlashSales, setActiveFlashSales] = useState([]);
  const [activeSeasonalSales, setActiveSeasonalSales] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState({});
  const [seasonalSaleProducts, setSeasonalSaleProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active flash sales
      const flashSalesRes = await axios.get(
        `${API_URL}/api/flash-sales/active`
      );
      console.log("Flash Sales Response:", flashSalesRes.data);
      const flashSales = Array.isArray(flashSalesRes.data)
        ? flashSalesRes.data
        : [];
      setActiveFlashSales(flashSales);

      // Fetch products for each flash sale
      for (const sale of flashSales) {
        try {
          const productsRes = await axios.get(
            `${API_URL}/api/flash-sales/${sale.id}/products`
          );
          setFlashSaleProducts((prev) => ({
            ...prev,
            [sale.id]: productsRes.data.products || [],
          }));
        } catch (err) {
          console.error(
            `Error fetching products for flash sale ${sale.id}:`,
            err
          );
        }
      }

      // Fetch active seasonal sales
      const seasonalSalesRes = await axios.get(
        `${API_URL}/api/seasonal-sales/active`
      );
      console.log("Seasonal Sales Response:", seasonalSalesRes.data);
      const seasonalSales = Array.isArray(seasonalSalesRes.data)
        ? seasonalSalesRes.data
        : [];
      setActiveSeasonalSales(seasonalSales);

      // Fetch products for each seasonal sale
      for (const sale of seasonalSales) {
        try {
          const productsRes = await axios.get(
            `${API_URL}/api/seasonal-sales/${sale.id}/products`
          );
          setSeasonalSaleProducts((prev) => ({
            ...prev,
            [sale.id]: productsRes.data.products || [],
          }));
        } catch (err) {
          console.error(
            `Error fetching products for seasonal sale ${sale.id}:`,
            err
          );
        }
      }

      // Fetch regular products
      const productsRes = await axios.get(`${API_URL}/api/products`);
      console.log("Products Response:", productsRes.data);
      setProducts(productsRes.data.data || productsRes.data.products || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error.response?.data?.error || error.message || "Failed to load data"
      );

      // Set empty arrays on error to prevent crashes
      setActiveFlashSales([]);
      setActiveSeasonalSales([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            Loading amazing deals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 animate-pulse">
              Welcome to AHIA
            </h1>
            <p className="text-xl mb-8">
              Discover amazing flash deals and unbeatable prices
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105">
                Shop Flash Sales
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-red-600 transition-all">
                Browse All Products
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Flash Sales */}
        {activeFlashSales.map((sale) => {
          const products = flashSaleProducts[sale.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={sale.id} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-lg">
                    <Flame className="text-white" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {sale.title}
                    </h2>
                    <p className="text-gray-600">
                      Limited time only - Grab them before they're gone!
                    </p>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2">
                  View All <ChevronRight />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <FlashSaleCard
                    key={product.id}
                    product={product}
                    saleEndTime={sale.end_time}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Active Seasonal Sales */}
        {activeSeasonalSales.map((sale) => {
          const products = seasonalSaleProducts[sale.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={sale.id} className="mb-12">
              <div
                className="rounded-2xl p-8 mb-6"
                style={{
                  background: sale.banner_color
                    ? `linear-gradient(135deg, ${sale.banner_color}20, ${sale.banner_color}40)`
                    : "linear-gradient(135deg, #10b98120, #06b6d440)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                      {sale.name} - {sale.season}
                    </h2>
                    <p className="text-gray-700 text-lg mb-4">
                      {sale.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="bg-white px-4 py-2 rounded-full font-bold text-green-600">
                        Up to {sale.discount_percentage}% OFF
                      </span>
                      <span className="text-gray-700">
                        {sale.product_count} products available
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Sale ends</div>
                    <div className="text-2xl font-bold text-gray-800">
                      {new Date(sale.end_time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <SeasonalSaleCard
                    key={product.id}
                    product={product}
                    sale={sale}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Featured Products */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Tag className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Featured Products
                </h2>
                <p className="text-gray-600">Handpicked items just for you</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      "https://via.placeholder.com/300x300?text=Product"
                    }
                    alt={product.name}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star
                        className="fill-yellow-400 text-yellow-400"
                        size={16}
                      />
                      <span className="text-sm text-gray-600">
                        {product.rating || 4.5}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      ₦{product.price?.toLocaleString()}
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeFlashSales.length === 0 &&
          activeSeasonalSales.length === 0 &&
          products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl">
              <Flame className="text-gray-300 mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Active Sales Right Now
              </h3>
              <p className="text-gray-600">
                Check back soon for amazing deals!
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default FlashSeasonalHomePage;
