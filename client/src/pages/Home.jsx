import React, { useEffect, useState } from "react";
import CallToAction from "../components/CallToAction";
import ProductCard from "../components/PostCard";
import { Link } from "react-router-dom";
import Hero from "../components/test/Hero/Hero";
import { getAllProducts } from "../Utils/ApiFunctions";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllProducts();
        setProducts(data);
        setShowMore(data.length === 9);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleShowMore = async () => {
    const numberOfProducts = products.length;
    try {
      const data = await getAllProducts();
      const newProducts = data.slice(numberOfProducts, numberOfProducts + 9);
      setProducts((prev) => [...prev, ...newProducts]);
      setShowMore(newProducts.length === 9);
    } catch (error) {
      console.error("Error fetching more products:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto ">
        <h1 className="text-3xl font-bold lg:text-6xl">
          Xin chào tới website của anhempcPRO
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Tại đây chúng tôi cung cấp cho các bạn cấu hình máy tính , linh kiện
          điện tử phù hợp với giá tiền , yêu cầu và nhu cầu của các bạn. đồng
          thời tư vấn và xây dựng website , cung cấp dịch vụ theo nhu cầu
        </p>
        <Link
          to="/search"
          className="text-xs sm:text-sm text-teal-500 font-bold hover:underline"
        >
          Xem tất cả các cấu hình và linh kiện tại đây
        </Link>
      </div>

      <Hero />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Featured Products:
        </h1>
        <div className="p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {!loading && products.length === 0 && (
            <p className="text-xl text-gray-500 col-span-full">
              No products found.
            </p>
          )}
          {loading && (
            <p className="text-xl text-gray-500 col-span-full">Loading...</p>
          )}
          {!loading &&
            products &&
            products.map((product) => (
              <div
                key={product.productId}
                className="w-full flex justify-center"
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>
        {showMore && (
          <button
            onClick={handleShowMore}
            className="text-teal-500 text-lg hover:underline p-7 w-full"
          >
            Show More
          </button>
        )}
        <div className="flex justify-center pb-7">
          <Link to="/search" className="text-lg text-teal-500 hover:underline">
            View all products
          </Link>
        </div>
      </div>
      <div className="p-3 bg-amber-100 dark:bg-slate-700">
        <CallToAction />
      </div>
    </div>
  );
};

export default Home;
