import { Button } from "flowbite-react";
import thump from "../assets/thump.png";
export default function CallToAction() {
  return (
    <div className="flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center">
      <div className="flex-1 justify-center flex flex-col">
        <h2 className="text-2xl">
          Cần linh kiện máy tính chất lượng hoặc dịch vụ thiết kế website chuyên
          nghiệp?
        </h2>
        <p className="text-gray-500 my-2">
          Khám phá các gói dịch vụ và sản phẩm cao cấp của chúng tôi ngay hôm
          nay!
        </p>
        <Button
          gradientDuoTone="purpleToPink"
          className="rounded-tl-xl rounded-bl-none"
        >
          <a href="anhempcpro.store" target="_blank" rel="noopener noreferrer">
            Xây dựng PC của bạn ngay bây giờ
          </a>
        </Button>
      </div>
      <div className="p-7 flex-1">
        <img src={thump} alt="Linh kiện máy tính và dịch vụ website" />
      </div>
    </div>
  );
}
