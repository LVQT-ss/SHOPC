import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getAllBlogs } from "../../Utils/ApiFunctions";
import LoadingSpinner from "../../components/Loading/loadingSpinner";

const blogCards = [
  {
    id: 1,
    title: "RTX 5090",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
  {
    id: 2,
    title: "RTX 4080",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
  {
    id: 3,
    title: "RTX 3090",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
  {
    id: 4,
    title: "RTX 2080",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/20-series/rtx-2080/geforce-rtx-2080-learn-more-og-1200x630.jpg",
  },
  {
    id: 5,
    title: "RTX 1080",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
  {
    id: 6,
    title: "RTX 1080",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
  {
    id: 7,
    title: "RTX 1080",
    img: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/graphic-cards/50-series/rtx-5090/geforce-rtx-5090-learn-more-og-1200x630.jpg",
  },
];

export default function BlogHeader() {
    const [index, setIndex] = useState(0);
    const nextSlide = () => setIndex((prev) => (prev + 1) % (blogCards.length - 3));
    const prevSlide = () => setIndex((prev) => (prev - 1 + blogCards.length - 3) % (blogCards.length - 3));
    const [blogs, setBlogs] =  useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      setLoading(true);
      try {
        const data = await getAllBlogs();
        if (data) {
          setBlogs(data);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBlogs();
  }, []);

  if (loading) return <LoadingSpinner />;
  
    return (
      <div className="flex justify-between items-center w-full h-48 px-4">
        <div className="flex gap-2 w-auto h-12">
          <button onClick={prevSlide} className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <ArrowLeft size={15} />
          </button>
          <button onClick={nextSlide} className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <ArrowRight size={15} />
          </button>
        </div>
  
        <div className="w-3/4 overflow-hidden">
        <div className="flex justify-between transition-transform ease-in-out duration-500" style={{ transform: `translateX(-${index * 100/3}%)` }}>
          {blogs.slice(0, 6).map((card) => (
            <a key={card.blogId} className="flex flex-shrink-0 w-[calc(100%/3-1rem)] h-40 border rounded-lg overflow-hidden bg-gray-100 shadow-md mx-2">
              <img src={card.product.image} className="w-1/2 h-full object-cover" alt={card.blogTitle} />
              <div className="flex flex-col justify-center px-4 bg-gray-200 w-1/2">
                <p className="text-md font-semibold text-center">{card.blogTitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
    );
  }