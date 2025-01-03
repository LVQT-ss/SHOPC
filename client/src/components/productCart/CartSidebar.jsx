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
import { Alert } from "flowbite-react";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  const sidebarRef = useRef(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
  });

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
      const orderData = {
        userId: 1,
        totalAmount: totalPrice,
        orderStatus: "active",
        guestAddress: formData.address,
        guestPhoneNum: formData.phoneNumber,
        orderItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        })),
      };

      await createOrder(orderData);
      setSuccess(true);
      dispatch(clearCart());

      // Reset checkout state after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setIsCheckingOut(false);
        dispatch(toggleCart());
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderFooter = () => {
    if (success) {
      return (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Alert>Order placed successfully! Thank you for your purchase.</Alert>
        </Alert>
      );
    }

    if (isCheckingOut) {
      return (
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <Alert>{error}</Alert>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          <div className="flex justify-between font-semibold mb-2">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
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
          <span className="font-bold">${totalPrice.toFixed(2)}</span>
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
        className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out"
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
                    ${(item.productPrice * item.quantity).toFixed(2)}
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
