import { useSelector, useDispatch } from "react-redux";
import { X, Plus, Minus, ShoppingCart, Loader2, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  toggleCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../redux/cart/cartSlice";
import {
  createOrder,
  startCheckingLatestOrder,
  stopCheckingOrders,
} from "../../Utils/ApiFunctions";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = !!currentUser;
  const sidebarRef = useRef(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes = 600 seconds
  const [orderResponse, setOrderResponse] = useState(null);
  const [orderStatusChecking, setOrderStatusChecking] = useState(false);
  const countdownIntervalRef = useRef(null);
  const orderStatusCheckIntervalRef = useRef(null);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestAddress: "",
    guestPhoneNum: "",
    payment: "",
  });

  // Reset checkout state when closing checkout
  const resetCheckoutState = () => {
    setIsCheckingOut(false);
    setPaymentStep(null);
    setOrderResponse(null);
    setOrderStatusChecking(false);
    setError("");
    setSuccess(false);

    // Clear all intervals
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (orderStatusCheckIntervalRef.current) {
      clearInterval(orderStatusCheckIntervalRef.current);
      orderStatusCheckIntervalRef.current = null;
    }

    // Reset form data
    setFormData({
      guestName:
        isAuthenticated && currentUser ? currentUser.username || "" : "",
      guestEmail: isAuthenticated && currentUser ? currentUser.email || "" : "",
      guestAddress:
        isAuthenticated && currentUser ? currentUser.userAddress || "" : "",
      guestPhoneNum:
        isAuthenticated && currentUser ? currentUser.userPhoneNumber || "" : "",
      payment: "",
    });
  };

  // Initialize form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFormData({
        guestName: currentUser.username || "",
        guestEmail: currentUser.email || "",
        guestAddress: currentUser.userAddress || "",
        guestPhoneNum: currentUser.userPhoneNumber || "",
        payment: "",
      });
    }
  }, [isAuthenticated, currentUser]);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        dispatch(toggleCart());
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dispatch]);

  // Countdown timer logic
  useEffect(() => {
    if (paymentStep === "qr" && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            // Cancel order or reset payment
            setPaymentStep(null);
            setOrderResponse(null);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [paymentStep, countdown]);

  // Order status checking logic
  const startOrderStatusChecking = async () => {
    try {
      // Stop any existing checking
      await stopCheckingOrders();

      // Start new order status checking
      const response = await startCheckingLatestOrder();

      // Set up interval to periodically check
      orderStatusCheckIntervalRef.current = setInterval(async () => {
        try {
          const statusResponse = await startCheckingLatestOrder();

          if (statusResponse.orderStatus === "complete") {
            // Payment successful
            clearInterval(orderStatusCheckIntervalRef.current);
            handlePaymentComplete();
          }
        } catch (error) {
          console.error("Error checking order status:", error);
          // Stop checking if there's an error
          clearInterval(orderStatusCheckIntervalRef.current);
        }
      }, 10000); // Check every 10 seconds

      setOrderStatusChecking(true);
    } catch (error) {
      console.error("Error starting order status checking:", error);
      setError(error.message);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userId =
        isAuthenticated && currentUser ? currentUser.user.userId : 1;

      const orderData = {
        userId: userId,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestAddress: formData.guestAddress,
        guestPhoneNum: formData.guestPhoneNum,
        payment: formData.payment,
        totalAmount: totalPrice,
        orderStatus: "active",
        orderItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
      };

      const response = await createOrder(orderData);

      // Set the full order response for QR payment
      setOrderResponse(response);
      // Move to QR payment step
      setPaymentStep("qr");
      // Start order status checking
      await startOrderStatusChecking();
      // Reset countdown
      setCountdown(600);
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // Handle successful payment
    setSuccess(true);
    dispatch(clearCart());

    // Clear intervals
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (orderStatusCheckIntervalRef.current) {
      clearInterval(orderStatusCheckIntervalRef.current);
    }

    setTimeout(() => {
      resetCheckoutState();
      dispatch(toggleCart());
    }, 2000);
  };

  const renderQRPayment = () => {
    if (!orderResponse) return null;

    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <img
            src={orderResponse.payment.vietQRUrl}
            alt="VietQR Payment"
            className="w-64 h-64 object-contain"
          />
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-500">
              Time Remaining: {formatTime(countdown)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Please scan the QR code to complete your payment within the time
            limit.
          </p>
          <div className="text-center text-sm text-gray-500 mb-4">
            {orderStatusChecking
              ? "Checking payment status..."
              : "Payment verification in progress"}
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (success) {
      return (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded">
          Order placed successfully! Thank you for your purchase.
        </div>
      );
    }

    if (paymentStep === "qr") {
      return renderQRPayment();
    }

    if (isCheckingOut) {
      return (
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Show a message indicating if user is logged in or checking out as guest */}
          <div className="p-2 bg-blue-50 text-blue-800 border border-blue-200 rounded text-sm">
            {isAuthenticated && currentUser
              ? `Ordering as ${currentUser.username}. Your order will be saved to your account (ID: ${currentUser.userId}).`
              : "Checking out as guest. Please fill in your details below."}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="guestEmail"
              value={formData.guestEmail}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Address
            </label>
            <textarea
              name="guestAddress"
              value={formData.guestAddress}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
              rows="2"
              placeholder="123 Main St, City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="guestPhoneNum"
              value={formData.guestPhoneNum}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              name="payment"
              value={formData.payment}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">Select Payment Method</option>
              <option value="credit_card">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="flex justify-between font-semibold mb-2">
            <span>Total:</span>
            <span>{totalPrice.toFixed(2)} vnđ</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={resetCheckoutState}
              className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </form>
      );
    }

    return (
      <>
        <div className="flex justify-between mb-4">
          <span className="font-semibold">Total:</span>
          <span className="font-bold">{totalPrice.toFixed(2)} vnđ</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleClearCart}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear Cart
          </button>
          <button
            onClick={() => setIsCheckingOut(true)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out"
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {isCheckingOut ? "Checkout" : "Shopping Cart"}
          </h2>
          <button
            onClick={() => {
              resetCheckoutState();
              dispatch(toggleCart());
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-180px)] p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 mb-4 border-b pb-4 dark:border-gray-700"
              >
                <img
                  src={item.image || "/api/placeholder/80/80"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.productName}</h3>
                  <p className="text-green-600 font-semibold">
                    {(item.productPrice * item.quantity).toFixed(2)} vnđ
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
