import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/store/cart";

export default function PostCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
    <div className="relative w-full border border-teal-500 rounded-lg sm:w-[325px]">
      <div className="cursor-pointer overflow-hidden">
        <img
          src={product.image || "/placeholder-image.png"}
          alt={product.productName}
          className="h-[260px] w-full object-cover hover:scale-110 transition-all duration-300"
        />
      </div>

      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">
          {product.productName}
        </p>
        <span className="italic text-sm">{product.productDescription}</span>
        <div className="flex justify-between items-center">
          <span className="font-bold text-green-600">
            ${parseFloat(product.productPrice).toLocaleString()}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              product.isActive === "active"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {product.isActive === "active" ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() =>
              (window.location.href = `/product/${product.productId}`)
            }
            className="flex-1 bg-teal-500 text-white py-2 rounded-md text-center hover:bg-teal-600 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.isActive !== "active"}
            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
