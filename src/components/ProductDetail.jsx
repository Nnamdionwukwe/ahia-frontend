import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  StarHalf,
  Check,
  Truck,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  // Replace with actual product ID from URL params in real app
  const productId = id;

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://ahia-backend-production.up.railway.app/api/products/${productId}`
      );

      if (!response.ok) throw new Error("Product not found");

      const data = await response.json();
      setProduct(data);

      // Set first variant as default if variants exist
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-5 h-5 fill-yellow-400 text-yellow-400"
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-5 h-5 fill-yellow-400 text-yellow-400"
        />
      );
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }
    return stars;
  };

  const calculatePrice = () => {
    if (selectedVariant) {
      const discount = selectedVariant.discount_percentage || 0;
      const price = selectedVariant.base_price;
      return {
        current: price * (1 - discount / 100),
        original: price,
        discount: discount,
      };
    }
    return {
      current: product?.product.price || 0,
      original: product?.product.original_price || 0,
      discount: product?.product.discount_percentage || 0,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">❌ {error}</p>
          <button
            onClick={fetchProductDetails}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const { product: productData, images, variants } = product;
  const displayImages = images.length > 0 ? images : productData.images || [];
  const prices = calculatePrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold truncate">{productData.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={
                  displayImages[selectedImage]?.image_url ||
                  displayImages[selectedImage]
                }
                alt={displayImages[selectedImage]?.alt_text || productData.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url || img}
                    alt={img.alt_text || `View ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productData.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(productData.rating)}
                </div>
                <span className="text-gray-600">
                  {productData.rating} (
                  {productData.total_reviews.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Seller Info */}
            {productData.store_name && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Sold by</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{productData.store_name}</p>
                    {productData.verified && (
                      <Check className="w-5 h-5 text-blue-600 bg-blue-100 rounded-full p-0.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{productData.seller_rating}</span>
                    <span>•</span>
                    <span>
                      {productData.total_followers?.toLocaleString()} followers
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${prices.current.toFixed(2)}
                </span>
                {prices.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ${prices.original.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                      -{prices.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Tax included. Free shipping on orders over $50
              </p>
            </div>

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-3">Select Variant:</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border-2 transition ${
                          selectedVariant?.id === variant.id
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {variant.color && <span>{variant.color}</span>}
                        {variant.size && <span> - {variant.size}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-semibold mb-3">Quantity:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {productData.stock_quantity} items available
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="w-full py-4 border-2 border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-semibold">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Check className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-3">Product Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {productData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
