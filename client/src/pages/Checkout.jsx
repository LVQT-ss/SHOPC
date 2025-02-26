import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/cart/cartSlice";
import { createOrder } from "../Utils/ApiFunctions";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert } from "flowbite-react";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null); // Lưu ID của đơn hàng sau khi tạo
  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
  });

  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý khi nhấn "Place Order"
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        userId: 1,
        totalAmount,
        orderStatus: "inactive",
        guestAddress: formData.address,
        guestPhoneNum: formData.phoneNumber,
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
      };

      const orderResponse = await createOrder(orderData);
      setSuccess(true);
      setOrderId(orderResponse.orderId); // Lưu orderId để dùng cho "Pay Now"
      dispatch(clearCart());

      // Reset form
      setFormData({
        address: "",
        phoneNumber: "",
      });

      // Hiển thị thông báo thành công
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn "Pay Now"
  const handlePayNow = () => {
    if (!orderId) {
      setError("Please place an order first!");
      return;
    }
    navigate(`/payment/${orderId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <Alert>{error}</Alert>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Alert>Success!</Alert>
          <Alert>Order placed successfully.</Alert>
        </Alert>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.productName} x {item.quantity}
              </span>
              <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-4 font-bold">
            <span>Total: ${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Delivery Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
            rows="3"
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </form>

      {/* Nút Pay Now */}
      <button
        onClick={handlePayNow}
        disabled={!orderId}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4"
      >
        Pay Now
      </button>
    </div>
  );
};

export default Checkout;
