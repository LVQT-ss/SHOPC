import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";
import {
  getAllProducts,
  deleteProduct,
  updateProductActiveStatus,
} from "../../Utils/ApiFunctions";
import LoadingSpinner from "../Loading/loadingSpinner";

const categories = [
  { categoryId: 1, categoryName: "Combo Pc" },
  { categoryId: 2, categoryName: "Bo mạch chủ" },
  { categoryId: 3, categoryName: "Bộ vi xử lý" },
  { categoryId: 4, categoryName: "RAM" },
  { categoryId: 5, categoryName: "Ổ cứng HDD" },
  { categoryId: 6, categoryName: "Ổ cứng SSD" },
  { categoryId: 7, categoryName: "Card đồ họa" },
  { categoryId: 8, categoryName: "Nguồn điện PSU" },
  { categoryId: 9, categoryName: "CPU Fan" },
  { categoryId: 10, categoryName: "Ổ đĩa quang" },
  { categoryId: 11, categoryName: "Card mạng" },
  { categoryId: 12, categoryName: "Vỏ máy tính" },
];

const DashPosts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      if (data) {
        setProducts(data);
        setShowMore(data.length === 9);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(productIdToDelete);
      setProducts((prev) =>
        prev.filter((product) => product.productId !== productIdToDelete)
      );
      setShowDeleteModal(false);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(error.message);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateProductActiveStatus(productId, newStatus);
      setProducts((prev) =>
        prev.map((product) =>
          product.productId === productId
            ? { ...product, isActive: newStatus }
            : product
        )
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.categoryName : "Unknown Category";
  };

  const handleShowMore = async () => {
    setLoadingMore(true);
    const startIndex = products.length;
    try {
      const data = await getAllProducts();
      const newProducts = data.slice(startIndex, startIndex + 9);
      setProducts((prev) => [...prev, ...newProducts]);
      setShowMore(newProducts.length === 9);
    } catch (error) {
      console.error("Error fetching more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">All Products</h2>
        <Link to="/create-product">
          <Button gradientDuoTone="purpleToPink">Add New Product</Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell>Product Details</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {products.map((product) => (
                <Table.Row
                  key={product.productId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.productName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.productDescription}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-medium">
                      ${parseFloat(product.productPrice).toLocaleString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{getCategoryName(product.categoryId)}</Table.Cell>
                  <Table.Cell>
                    <button
                      onClick={() =>
                        handleToggleActive(product.productId, product.isActive)
                      }
                      className={`px-3 py-1 rounded-full text-sm ${
                        product.isActive === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {product.isActive === "active" ? "Active" : "Inactive"}
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Link
                        to={`/update-post/${product.productId}`}
                        className="font-medium text-teal-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setProductIdToDelete(product.productId);
                          setShowDeleteModal(true);
                        }}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {showMore && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleShowMore}
                outline
                gradientDuoTone="purpleToPink"
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Show More"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xl text-gray-500">No products found</p>
        </div>
      )}

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this product?
            </h3>
            {deleteError && (
              <Alert color="failure" className="mb-4">
                {deleteError}
              </Alert>
            )}
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteProduct}>
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashPosts;
