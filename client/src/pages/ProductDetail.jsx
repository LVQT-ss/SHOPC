import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAllProducts } from "../Utils/ApiFunctions";
import LoadingSpinner from "../components/Loading/loadingSpinner";
import ProductCard from "../components/PostCard";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const data = await getAllProducts();
        const selectedProduct = data.find(
          (p) => p.productId === parseInt(productId)
        );
        setProduct(selectedProduct);

        if (selectedProduct) {
          const related = data
            .filter(
              (p) =>
                p.categoryId === selectedProduct.categoryId &&
                p.productId !== selectedProduct.productId
            )
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  if (loading) return <LoadingSpinner />;
  if (!product)
    return (
      <p className="text-center text-gray-500 text-lg font-medium">
        Product not found
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-white to-gray-100 shadow-2xl rounded-xl">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">
        {product.productName}
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.productName}
            className="w-full h-96 object-cover rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 space-y-6">
          <p className="text-3xl font-semibold text-gray-900">
            ${parseFloat(product.productPrice).toLocaleString()}
          </p>
          <p className="text-gray-600 leading-relaxed">
            {product.productDescription}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Category:</span>{" "}
            {product.categoryId}
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            🛒 Mua Ngay
          </button>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">
          🔍 Thông số kỹ thuật
        </h3>
        <table className="w-full mt-4 border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-semibold bg-gray-100 text-gray-700 w-1/3 rounded-l-lg">
                Chất liệu
              </td>
              <td className="p-3 text-gray-800">Hợp kim nhôm</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold bg-gray-100 text-gray-700 w-1/3 rounded-l-lg">
                Trọng lượng
              </td>
              <td className="p-3 text-gray-800">1.2 kg</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
          🛍️ Sản phẩm liên quan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.productId}
                product={relatedProduct}
              />
            ))
          ) : (
            <p className="text-gray-500">Không có sản phẩm liên quan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
