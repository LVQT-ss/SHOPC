import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/PostCard.jsx";

const categories = [
  {
    categoryId: 1,
    categoryName: "Combo Pc",
    categoryType: "Combo Pc",
  },
  {
    categoryId: 2,
    categoryName: "Bo mạch chủ",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 3,
    categoryName: "Bộ vi xử lý",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 4,
    categoryName: "RAM",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 5,
    categoryName: "Ổ cứng HDD",
    categoryType: "Lưu trữ",
  },
  {
    categoryId: 6,
    categoryName: "Ổ cứng SSD",
    categoryType: "Lưu trữ",
  },
  {
    categoryId: 7,
    categoryName: "Card đồ họa",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 8,
    categoryName: "Nguồn điện PSU",
    categoryType: "Linh kiện hỗ trợ",
  },
  {
    categoryId: 10,
    categoryName: "Ổ đĩa quang",
    categoryType: "Phụ kiện",
  },
  {
    categoryId: 11,
    categoryName: "Card mạng",
    categoryType: "Linh kiện kết nối",
  },
  {
    categoryId: 12,
    categoryName: "Vỏ máy tính",
    categoryType: "Phụ kiện",
  },
  {
    categoryId: 9,
    categoryName: "CPU Fan",
    categoryType: "Linh kiện hỗ trợ",
  },
];

export default function ProductSearch() {
  const [searchData, setSearchData] = useState({
    searchTerm: "",
    sort: "desc",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const sortFromUrl = urlParams.get("sort") || "desc";
    const categoryFromUrl = urlParams.get("categoryId") || "";
    const minPriceFromUrl = urlParams.get("minPrice") || "";
    const maxPriceFromUrl = urlParams.get("maxPrice") || "";

    // Update search data if URL parameters exist
    setSearchData({
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      categoryId: categoryFromUrl,
      minPrice: minPriceFromUrl,
      maxPrice: maxPriceFromUrl,
    });

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const searchQuery = urlParams.toString();
        const response = await fetch(
          `/api/products/getAllProducts?${searchQuery}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data || []); // Adjust based on actual API response
        setLoading(false);

        // Implement pagination logic
        setShowMore((data || []).length === 9);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSearchData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    // Add non-empty parameters to URL
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        urlParams.set(key, value);
      }
    });

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfProducts = products.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", numberOfProducts);

    try {
      const searchQuery = urlParams.toString();
      const response = await fetch(
        `/api/products/getAllProducts?${searchQuery}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch more products");
      }

      const data = await response.json();
      setProducts((prev) => [...prev, ...data.products]);
      setShowMore(data.products.length === 9);
    } catch (error) {
      console.error("Error fetching more products:", error);
    }
  };

  const handleReset = () => {
    setSearchData({
      searchTerm: "",
      sort: "desc",
      categoryId: "",
      minPrice: "",
      maxPrice: "",
    });
    navigate("/search");
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="whitespace-nowrap font-semibold">
            <label>Search Term:</label>
            <TextInput
              placeholder="Search products..."
              id="searchTerm"
              type="text"
              value={searchData.searchTerm}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort Price:</label>
            <Select onChange={handleChange} value={searchData.sort} id="sort">
              <option value="desc">Highest to Lowest</option>
              <option value="asc">Lowest to Highest</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <Select
              onChange={handleChange}
              value={searchData.categoryId}
              id="categoryId"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">Price Range:</label>
            <div className="flex gap-2">
              <TextInput
                placeholder="Min Price"
                type="number"
                id="minPrice"
                value={searchData.minPrice}
                onChange={handleChange}
              />
              <TextInput
                placeholder="Max Price"
                type="number"
                id="maxPrice"
                value={searchData.maxPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" outline gradientDuoTone="purpleToPink">
            Apply Filters
          </Button>
          <Button onClick={handleReset} color="gray">
            Reset Search
          </Button>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Product Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4 justify-center">
          {!loading && products.length === 0 && (
            <p className="text-xl text-gray-500">No products found.</p>
          )}
          {loading && <p className="text-xl text-gray-500">Loading...</p>}
          {!loading &&
            products &&
            products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 text-lg hover:underline p-7 w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
