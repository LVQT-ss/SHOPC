import { useDispatch } from "react-redux";
import { addToCart } from "../redux/store/cart";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const navigateToDetails = () => {
    window.location.href = `/product/${product.productId}`;
  };

  return (
    <div className="group relative w-full sm:w-[325px] border border-teal-500 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {/* Image container with consistent height */}
      <div
        className="cursor-pointer overflow-hidden h-[260px]"
        onClick={navigateToDetails}
      >
        <img
          src={product.image || "/placeholder-image.png"}
          alt={product.productName}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product information with improved spacing and alignment */}
      <div className="p-4 flex flex-col gap-3">
        <h3
          className="text-lg font-semibold line-clamp-2 min-h-[56px] hover:text-teal-600 cursor-pointer"
          onClick={navigateToDetails}
        >
          {product.productName}
        </h3>

        <div className="flex justify-between items-center">
          <span className="font-bold text-green-600 text-lg">
            {parseFloat(product.productPrice).toLocaleString()} vnđ
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              product.isActive === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.isActive === "active" ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Button container with equal sizing and improved hover effects */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={navigateToDetails}
            className="flex-1 bg-teal-500 text-white py-2 rounded-md text-center hover:bg-teal-600 transition-all duration-300 font-medium"
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.isActive !== "active"}
            className="flex-1 bg-blue-500 text-white py-2 rounded-md text-center transition-all duration-300 font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
