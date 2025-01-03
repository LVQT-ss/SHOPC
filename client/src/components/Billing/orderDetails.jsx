import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
import logo from "../../assets/logo.jpg";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "Roboto",
  },
  section: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  text: {
    fontFamily: "Roboto",
    fontSize: 10,
  },
  item: { marginBottom: 10, padding: 10, backgroundColor: "#f3f4f6" },
  total: { marginTop: 20, borderTopWidth: 1, paddingTop: 10 },
  warranty: {
    marginTop: 20,
    fontSize: 10,
    color: "#4B5563",
    fontFamily: "Roboto",
  },
  tdLeft: {
    display: "flex",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    textAlign: "left",
    fontSize: 14,
    justifyContent: "center",
    wordBreak: "break-word",
    flexWrap: "wrap",
  },
  td: {
    display: "flex",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    textAlign: "center",
    fontSize: 14,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  logo: {
    width: 150,
    height: 50,
    objectFit: "contain",
  },
  signature: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: 200,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderColor: "#000",
    marginTop: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Roboto",
  },
});

const OrderPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} src={logo} />
      </View>

      <Text style={styles.title}>Hóa Đơn Bán Hàng</Text>

      <View style={styles.header}>
        <Text style={styles.text}>Mã đơn hàng: {order.orderNumber}</Text>
        <Text style={styles.text}>
          Ngày: {new Date(order.orderDate).toLocaleDateString("vi-VN")}
        </Text>
        <Text style={styles.text}>Người bán:</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.bold, styles.text]}>Thông tin khách hàng</Text>
        <Text style={styles.text}>
          Tên: {order.guestName || order.user?.username}
        </Text>
        <Text style={styles.text}>
          Email: {order.guestEmail || order.user?.email}
        </Text>
        <Text style={styles.text}>Địa chỉ: {order.guestAddress}</Text>
        <Text style={styles.text}>Số điện thoại: {order.guestPhoneNum}</Text>
      </View>

      <Table style={styles.table}>
        <TR style={styles.tableHeader}>
          <TD style={[styles.td, styles.bold, { flex: 0.5 }]}>STT</TD>
          <TD style={[styles.tdLeft, styles.bold, { flex: 4 }]}>Sản Phẩm</TD>
          <TD style={[styles.td, styles.bold, { flex: 0.5 }]}>SL</TD>
          <TD style={[styles.td, styles.bold, { flex: 2 }]}>Đơn Giá</TD>
          <TD style={[styles.td, styles.bold, { flex: 2 }]}>Tổng tiền</TD>
          <TD style={[styles.td, styles.bold, { flex: 1 }]}>Bảo hành</TD>
        </TR>
        {order.orderDetails.map((item) => (
          <TR key={item.orderDetailsId}>
            <TD style={[styles.td, styles.text, { flex: 0.5 }]}>1</TD>
            <TD style={[styles.tdLeft, styles.text, { flex: 4 }]}>
              {item.product.productName}
            </TD>
            <TD style={[styles.td, styles.text, { flex: 0.5 }]}>
              {item.quantity}
            </TD>
            <TD style={[styles.td, styles.text, { flex: 2 }]}>
              {parseFloat(item.price).toLocaleString("vi-VN")} đ
            </TD>
            <TD style={[styles.td, styles.text, { flex: 2 }]}>
              {(parseFloat(item.price) * item.quantity).toLocaleString("vi-VN")}{" "}
              đ
            </TD>
            <TD style={[styles.td, styles.text, { flex: 1 }]}>12 tháng</TD>
          </TR>
        ))}
      </Table>

      <View style={styles.total}>
        <View style={styles.row}>
          <Text style={[styles.bold, styles.text]}>
            Tổng tiền cần thanh toán
          </Text>
          <Text style={[styles.bold, styles.text]}>
            {parseFloat(order.orderTotal).toLocaleString("vi-VN")} vnđ
          </Text>
        </View>
      </View>

      <View style={styles.warranty}>
        <Text>
          * Các trường hợp bảo hành vui lòng xem tại: anhempcpro.store/about
        </Text>
      </View>
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Người nhận hàng</Text>
          <Text style={[styles.signatureLabel, { fontSize: 8 }]}>
            (Ký và ghi rõ họ tên)
          </Text>
        </View>

        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Người giao hàng</Text>
          <Text style={[styles.signatureLabel, { fontSize: 8 }]}>
            (Ký và ghi rõ họ tên)
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
          <Button color="gray" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
              <p className="text-gray-500">
                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
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
            <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
            <p>Tên: {order.guestName || order.user?.username}</p>
            <p>Email: {order.guestEmail || order.user?.email}</p>
            <p>Địa chỉ: {order.guestAddress}</p>
            <p>Số điện thoại: {order.guestPhoneNum}</p>
            <p>Phương thức thanh toán: {order.payment}</p>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Sản phẩm đặt hàng</h3>
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
                        Giá: {parseFloat(item.price).toLocaleString("vi-VN")} đ
                        × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {(parseFloat(item.price) * item.quantity).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Tổng đơn hàng</h3>
            <div className="flex justify-between">
              <span>Tổng cộng</span>
              <span className="font-bold">
                {parseFloat(order.orderTotal).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Xem trước PDF</h3>
            <div className="w-full h-[500px]">
              <PDFViewer width="100%" height="100%">
                <OrderPDF order={order} />
              </PDFViewer>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-center">
            <PDFDownloadLink
              document={<OrderPDF order={order} />}
              fileName={`order-${order.orderNumber}.pdf`}
            >
              {({ loading }) => (
                <Button gradientDuoTone="purpleToBlue" disabled={loading}>
                  {loading ? "Đang tạo PDF..." : "In hóa đơn"}
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
