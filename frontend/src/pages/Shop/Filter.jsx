import React, { useState, useEffect } from "react";
import api from "../../config/axios";

const Filter = ({ setSelectedCategoryId }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories/getAllCategories");
        const fetchedCategories = response.data.map((category) => ({
          id: category.categoryId,
          name: category.categoryName,
        }));
        setCategories([{ id: "All", name: "All" }, ...fetchedCategories]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div
        style={{
          width: "35%",
          overflowX: "auto",
          whiteSpace: "nowrap",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
          scrollbarWidth: "none",
        }}
        className="custom-scrollbar"
      >
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          categories.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => {
                setActiveCategory(name);
                setSelectedCategoryId(id);
              }}
              style={{
                minWidth: "100px",
                padding: "10px 15px",
                margin: "0 5px",
                backgroundColor: activeCategory === name ? "red" : "#fff",
                color: activeCategory === name ? "#fff" : "#000",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </button>
          ))
        )}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Filter;
