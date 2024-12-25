import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20, textAlign: "center" },
  header: { fontSize: 14, marginBottom: 20 },
  section: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bold: { fontWeight: "bold" },
  item: { marginBottom: 10, padding: 10, backgroundColor: "#f3f4f6" },
  total: { marginTop: 20, borderTopWidth: 1, paddingTop: 10 },
});

const OrderPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Order Invoice</Text>

      <View style={styles.header}>
        <Text>Order Number: {order.orderNumber}</Text>
        <Text>Date: {new Date(order.orderDate).toLocaleDateString()}</Text>
        <Text>Status: {order.orderStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Customer Information</Text>
        <Text>Name: {order.user.username}</Text>
        <Text>Email: {order.user.email}</Text>
        {order.guestAddress && <Text>Address: {order.guestAddress}</Text>}
        {order.guestPhoneNum && <Text>Phone: {order.guestPhoneNum}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Order Items</Text>
        {order.orderDetails.map((item) => (
          <View key={item.orderDetailsId} style={styles.item}>
            <Text>{item.product.productName}</Text>
            <View style={styles.row}>
              <Text>
                Price: ${parseFloat(item.price).toLocaleString()} ×{" "}
                {item.quantity}
              </Text>
              <Text>
                ${(parseFloat(item.price) * item.quantity).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.total}>
        <View style={styles.row}>
          <Text style={styles.bold}>Total Amount</Text>
          <Text style={styles.bold}>
            ${parseFloat(order.orderTotal).toLocaleString()}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

const OrderDetails = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <Button color="gray" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-6">
          {/* Previous OrderDetails content remains the same */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
              <p className="text-gray-500">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <Badge
              className={`${
                order.orderStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.orderStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {order.orderStatus}
            </Badge>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p>Name: {order.user.username}</p>
            <p>Email: {order.user.email}</p>
            {order.guestAddress && <p>Address: {order.guestAddress}</p>}
            {order.guestPhoneNum && <p>Phone: {order.guestPhoneNum}</p>}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-4">
              {order.orderDetails.map((item) => (
                <div
                  key={item.orderDetailsId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.product.productName}</p>
                      <p className="text-sm text-gray-500">
                        Price: ${parseFloat(item.price).toLocaleString()} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-bold">
                ${parseFloat(order.orderTotal).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PDF Download Button */}
          <div className="border-t pt-4 flex justify-center">
            <PDFDownloadLink
              document={<OrderPDF order={order} />}
              fileName={`order-${order.orderNumber}.pdf`}
            >
              {({ loading }) => (
                <Button gradientDuoTone="purpleToBlue" disabled={loading}>
                  {loading ? "Generating PDF..." : "Print Bill"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetails;
