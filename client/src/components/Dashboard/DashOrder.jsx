import React, { useEffect, useState } from "react";
import { Table, Button } from "flowbite-react";
import { getAllOrders } from "../../Utils/ApiFunctions";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import OrderDetails from "../Billing/orderDetails";

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-gray-200 dark:border-gray-700">
        <div className="h-16 flex items-center space-x-4 px-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>
    ))}
  </div>
);

const DashOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      setError(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];

    if (statusFilter !== "all") {
      sortableOrders = sortableOrders.filter(
        (order) => order.orderStatus === statusFilter
      );
    }

    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        if (sortConfig.key === "orderTotal") {
          return sortConfig.direction === "asc"
            ? parseFloat(a.orderTotal) - parseFloat(b.orderTotal)
            : parseFloat(b.orderTotal) - parseFloat(a.orderTotal);
        }
        if (sortConfig.key === "orderDate") {
          return sortConfig.direction === "asc"
            ? new Date(a.orderDate) - new Date(b.orderDate)
            : new Date(b.orderDate) - new Date(a.orderDate);
        }
        return 0;
      });
    }

    return sortableOrders;
  }, [orders, sortConfig, statusFilter]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">All Orders</h2>
        <div className="flex gap-2">
          <select
            className="rounded border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Pending</option>
            <option value="complete">complete</option>
            <option value="inactive">Cancelled</option>
          </select>
          <Button
            onClick={() => handleSort("orderTotal")}
            color="gray"
            size="sm"
          >
            Price{" "}
            {sortConfig.key === "orderTotal" &&
              (sortConfig.direction === "asc" ? (
                <HiSortAscending className="inline" />
              ) : (
                <HiSortDescending className="inline" />
              ))}
          </Button>
          <Button
            onClick={() => handleSort("orderDate")}
            color="gray"
            size="sm"
          >
            Date{" "}
            {sortConfig.key === "orderDate" &&
              (sortConfig.direction === "asc" ? (
                <HiSortAscending className="inline" />
              ) : (
                <HiSortDescending className="inline" />
              ))}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Order Number</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Products</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>details of order</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <TableSkeleton />
            ) : sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <Table.Row
                  key={order.orderId}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="font-medium">
                    {order.orderNumber}
                  </Table.Cell>
                  <Table.Cell>
                    {order.guestName || order.user?.username}
                  </Table.Cell>

                  <Table.Cell className="text-sm text-gray-500">
                    {order.guestEmail || order.user?.email}
                  </Table.Cell>
                  <Table.Cell>
                    {order.orderDetails.map((detail) => (
                      <div key={detail.orderDetailsId} className="mb-2">
                        <span className="font-medium">
                          {detail.product.productName}
                        </span>
                        <br />
                        <span className="text-sm text-gray-500">
                          Quantity: {detail.quantity}
                        </span>
                      </div>
                    ))}
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    ${parseFloat(order.orderTotal).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(order.orderDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.orderStatus === "inactive"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.orderStatus === "complete"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      gradientDuoTone="purpleToBlue"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-4">
                  <p className="text-xl text-gray-500">No orders found</p>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
      {showDetails && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default DashOrder;
