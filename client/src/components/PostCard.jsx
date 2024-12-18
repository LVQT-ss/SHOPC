import { Link } from "react-router-dom";

export default function PostCard({ product }) {
  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[400px] overflow-hidden rounded-lg sm:w-[325px] transition-all">
      <Link to={`/product/${product.productId}`}>
        <img
          src={product.image || "/placeholder-image.png"}
          alt={product.productName}
          className="h-[260px] w-full object-cover group-hover:h-[200px] transition-all duration-300 z-20"
        />
      </Link>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">
          {product.productName}
        </p>
        <span className="italic text-sm">{product.productDescription}</span>
        <div className="flex justify-between items-center">
          <span className="font-bold text-green-600">
            ${parseFloat(product.productPrice).toFixed(2)}
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
        <Link
          to={`/product/${product.productId}`}
          className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
