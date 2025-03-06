import { useSelector, useDispatch } from "react-redux";
import { X, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  toggleCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../redux/cart/cartSlice";
import { createOrder } from "../../Utils/ApiFunctions";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  const { currentUser } = useSelector((state) => state.user); // Getting user from Redux
  const isAuthenticated = !!currentUser; // Derive authentication status from currentUser
  const sidebarRef = useRef(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestAddress: "",
    guestPhoneNum: "",
    payment: "",
  });

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
      // Extract userId from currentUser based on the structure you showed
      // Using the exact structure from your JSON example
      const userId =
        isAuthenticated && currentUser ? currentUser.user.userId : 1;

      console.log("Creating order with userId:", userId); // Debug log

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

      console.log("Order data being sent:", JSON.stringify(orderData)); // Debug log

      const response = await createOrder(orderData);
      console.log("Order creation response:", response); // Debug log

      setSuccess(true);
      dispatch(clearCart());

      setTimeout(() => {
        setSuccess(false);
        setIsCheckingOut(false);
        dispatch(toggleCart());
      }, 2000);
    } catch (err) {
      console.error("Order creation failed:", err); // Debug log
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderFooter = () => {
    if (success) {
      return (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded">
          Order placed successfully! Thank you for your purchase.
        </div>
      );
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
              Thanh toán bằng :
            </label>
            <select
              name="payment"
              value={formData.payment}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="credit_card">Ngân hàng</option>
              <option value="cash">Tiền mặt</option>
            </select>
          </div>

          <div className="flex justify-between font-semibold mb-2">
            <span>Total:</span>
            <span>{totalPrice.toFixed(2)} vnđ</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsCheckingOut(false)}
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
            onClick={() => dispatch(toggleCart())}
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
