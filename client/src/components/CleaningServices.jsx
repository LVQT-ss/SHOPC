import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/store/cart";

const CleaningServices = () => {
  const dispatch = useDispatch();

  const services = [
    {
      productId: 51,
      productName: "Gói Vệ sinh VIP 1 ( Vệ sinh Bụi bẩn) ",
      productDescription:
        "Làm sạch bụi bẩn trên bề mặt máy tính, bàn phím, màn hình. Dùng dung dịch chuyên dụng để lau màn hình và vỏ ngoài. Kiểm tra sơ bộ tình trạng máy.",
      productPrice: "150000.00",
      isActive: "active",
      image:
        "https://firebasestorage.googleapis.com/v0/b/mern-blog-b3bb7.appspot.com/o/1741663998283-images.jpg?alt=media&token=ba470f9f-f547-46fd-b03a-947cde8e2a59",
      warranty: null,
      categoryId: 13,
    },
    {
      productId: 52,
      productName: "Gói Nâng Cao ( VIP 2 ) - Vệ Sinh Toàn Diện",
      productDescription:
        "Bao gồm tất cả các bước của Gói Cơ Bản. Tháo máy, vệ sinh quạt tản nhiệt, bôi keo tản nhiệt mới. Làm sạch bụi bẩn bên trong linh kiện như bo mạch, RAM, card đồ họa.",
      productPrice: "300000.00",
      isActive: "active",
      image:
        "https://firebasestorage.googleapis.com/v0/b/mern-blog-b3bb7.appspot.com/o/1741664059488-images%20(1).jpg?alt=media&token=8c948403-2e85-4a07-b2e1-c58bb3b79041",
      warranty: null,
      categoryId: 13,
    },
    {
      productId: 53,
      productName: "Gói Chuyên Sâu - Vệ Sinh & Bảo Dưỡng",
      productDescription:
        "Vệ sinh toàn diện + kiểm tra nhiệt độ CPU, GPU, hiệu suất tản nhiệt. Tối ưu phần mềm, quét virus, loại bỏ file rác. Tư vấn nâng cấp phần cứng nếu cần. hỗ trợ cài window lại , tra keo gpu , lắp thêm tản mới ",
      productPrice: "500000.00",
      isActive: "active",
      image:
        "https://firebasestorage.googleapis.com/v0/b/mern-blog-b3bb7.appspot.com/o/1741664131705-maxresdefault.jpg?alt=media&token=9add747d-cb89-472a-84d1-8e0c1b05c0a9",
      warranty: null,
      categoryId: 13,
    },
  ];

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const navigateToDetails = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-700 mb-4">
            Dịch Vụ Vệ Sinh Máy Tính
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp các dịch vụ vệ sinh, bảo dưỡng máy tính chuyên
            nghiệp giúp kéo dài tuổi thọ thiết bị và tối ưu hiệu suất làm việc
            của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.productId}
              className={`group relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                index === 1
                  ? "md:transform md:-translate-y-4 border-2 border-teal-500 hover:border-teal-600"
                  : "border border-gray-200 hover:border-teal-400"
              } hover:-translate-y-2 hover:scale-105`}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-1 rounded-bl-lg font-medium z-10 group-hover:bg-teal-600 transition-colors duration-300">
                  Phổ biến nhất
                </div>
              )}

              <div className="h-56 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
                  <h3 className="text-xl font-bold">
                    {service.productName.split("-")[0]}
                  </h3>
                </div>
              </div>

              <div className="p-6 bg-white group-hover:bg-gray-50 transition-colors duration-300">
                <div className="mb-4 min-h-[100px]">
                  <p className="text-gray-700 mb-2 group-hover:text-gray-900 transition-colors duration-300">
                    {service.productDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-teal-600 group-hover:text-teal-700 group-hover:scale-110 transition-all duration-300 origin-left">
                    {parseInt(service.productPrice).toLocaleString()} VNĐ
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      service.isActive === "active"
                        ? "bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:text-green-900"
                        : "bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:text-red-900"
                    }`}
                  >
                    {service.isActive === "active" ? "Có sẵn" : "Hết hàng"}
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigateToDetails(service.productId)}
                    className="flex-1 bg-white border-2 border-teal-500 text-teal-500 font-medium py-2 rounded-md group-hover:bg-teal-50 group-hover:border-teal-600 group-hover:text-teal-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Chi Tiết
                  </button>
                  <button
                    onClick={() => handleAddToCart(service)}
                    disabled={service.isActive !== "active"}
                    className="flex-1 bg-teal-500 text-white font-medium py-2 rounded-md group-hover:bg-teal-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-md"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 left-0 w-0 h-0 border-t-[50px] border-l-[50px] border-t-transparent border-l-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-teal-50 p-8 rounded-lg max-w-4xl mx-auto transform hover:scale-102 hover:shadow-lg transition-all duration-500">
          <h3 className="text-2xl font-bold text-teal-700 mb-4">
            Tại sao nên vệ sinh máy tính định kỳ?
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
              <span className="text-teal-500 font-bold mr-2">✓</span>
              <span>Kéo dài tuổi thọ thiết bị, giảm nguy cơ hỏng hóc</span>
            </li>
            <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
              <span className="text-teal-500 font-bold mr-2">✓</span>
              <span>Cải thiện hiệu suất xử lý, giảm tình trạng lag, giật</span>
            </li>
            <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
              <span className="text-teal-500 font-bold mr-2">✓</span>
              <span>Giảm nhiệt độ hoạt động, bảo vệ linh kiện bên trong</span>
            </li>
            <li className="flex items-start hover:translate-x-2 transition-transform duration-300">
              <span className="text-teal-500 font-bold mr-2">✓</span>
              <span>
                Loại bỏ bụi bẩn, vi khuẩn, tạo môi trường làm việc sạch sẽ
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CleaningServices;
