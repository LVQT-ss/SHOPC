import React from "react";
import { Carousel } from "flowbite-react";

export default function Hero() {
  return (
    <>
      <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
        <Carousel slideInterval={5000} indicators={false}>
          <img
            src="https://www.intel.com/content/dam/www/central-libraries/us/en/images/2023-01/s9-u05-39-detail-shot-gaming-pc-original-rwd.jpg.rendition.intel.web.480.270.jpg"
            alt="..."
          />
          <img
            src="https://phucanhcdn.com/media/news/8949_ctkm_phu_kien_laptop_thang9.jpg"
            alt="..."
          />
          <img
            src="https://tmdpc.vn/media/news/3009_Linhkin-min.jpg"
            alt="..."
          />
          <img
            src="https://bizweb.dktcdn.net/100/374/108/files/km30-4.jpg?v=1650727308189"
            alt="..."
          />
          <img
            src="https://flowbite.com/docs/images/carousel/carousel-5.svg"
            alt="..."
          />
        </Carousel>
      </div>

      <div className="grid h-56 grid-cols-2 gap-4 sm:h-64 xl:h-80 2xl:h-96 mt-5 mb-10">
        <Carousel slideInterval={3000} indicators={false}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUuJYc0A2GI5yMuO4vbNkCwDKOKBNlHwqiqw&s"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvptg-dQd2pM8Xp-M1LYEohfEZbaCTgWyjuw&s"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOcb8Q6yY2hxyLBBTqhgxg8YBD-Sd_QuACBw&s"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSziCGeWIs_s4Xbk3lG6JAPrbgID1wQehMA6Q&s"
            alt="..."
          />
          <img
            src="https://genk.mediacdn.vn/zoom/600_315/139269124445442048/2023/10/11/avatar1697015204311-1697015205789978346881.jpg"
            alt="..."
          />
        </Carousel>
        <Carousel indicators={false}>
          <img
            src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/linh-kien-may-tinh/linh-kien-may-tinh-1.jpg"
            alt="..."
          />
          <img
            src="https://bcavn.com/Image/Picture/New/linh-kien-may-tinh.png"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh0g8QHmcsh9MF3wPofSqlV587KNFMDLiCaw&s"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh0g8QHmcsh9MF3wPofSqlV587KNFMDLiCaw&s"
            alt="..."
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh0g8QHmcsh9MF3wPofSqlV587KNFMDLiCaw&s"
            alt="..."
          />
        </Carousel>
      </div>
    </>
  );
}
