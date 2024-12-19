import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import Filter from "./Filter";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FooterContact from "./FooterContact";
import api from "../../config/axios";
import anhbia from "../../assets/anhbia.jpg";
import anhbia2 from "../../assets/wall.webp";
import anhbia3 from "../../assets/wall2.jpeg";

const Shop = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("All");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products/getAllProducts");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const filteredProducts =
    selectedCategoryId === "All"
      ? products
      : products.filter((product) => product.categoryId === selectedCategoryId);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Slider {...sliderSettings}>
          <div>
            <img
              src={anhbia}
              alt="Banner 1"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div>
            <img
              src={anhbia2}
              alt="Banner 2"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div>
            <img
              src={anhbia3}
              alt="Banner 3"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        </Slider>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Filter setSelectedCategoryId={setSelectedCategoryId} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          gap: "20px",
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.productId}
            style={{
              display: "flex",
              justifyContent: "center",
              flex: "0 1 calc(25% - 20px)",
              marginBottom: "20px",
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {/* <FooterContact /> */}
    </div>
  );
};

export default Shop;
