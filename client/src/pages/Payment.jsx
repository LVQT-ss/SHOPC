import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generateVietQR, getOrderById } from "../Utils/ApiFunctions";

const PaymentPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Lấy thông tin đơn hàng
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        // Gửi request để tạo VietQR
        const qrData = await generateVietQR(orderId, "qr_code");
        setQrCode(qrData.qrCode);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center">Payment Details</h1>

      {order && (
        <div className="border p-4 rounded-md bg-gray-100">
          <p>
            <strong>Order ID:</strong> {order.orderId}
          </p>
          <p>
            <strong>Total Amount:</strong> ${order.orderTotal}
          </p>
          <p>
            <strong>Payment Method:</strong> VietQR
          </p>
        </div>
      )}

      {qrCode && (
        <div className="text-center">
          <p className="font-semibold">Scan the QR Code to Pay:</p>
          <img src={qrCode} alt="VietQR Code" className="mx-auto w-64 h-64" />
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
