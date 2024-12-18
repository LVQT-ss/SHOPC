import { Button } from "flowbite-react";

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
          <a
            href="https://www.maytinhvaxaydungweb.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xây dựng PC của bạn ngay bây giờ
          </a>
        </Button>
      </div>
      <div className="p-7 flex-1">
        <img
          src="https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/470197675_122096580662686172_2572989348824324484_n.png?_nc_cat=109&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=z0_EDVvKPf8Q7kNvgEIktQP&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=AnBTm3QTdyEYYp9UOGQD6Uq&oh=00_AYDDSu1Oyh1_P0GZk2gFzX5ehYQfvQqSAjnDR8eliP4yvw&oe=6768C483"
          alt="Linh kiện máy tính và dịch vụ website"
        />
      </div>
    </div>
  );
}
