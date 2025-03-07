import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "../../Utils/ApiFunctions";
import LoadingSpinner from "../../components/Loading/loadingSpinner";

export default function BlogDetail() {
  const { id } = useParams();
  const [blogDetail, setBlogDetail] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogById = async () => {
      setLoading(true);
      try {
        const data = await getBlogById(id);
        if (data) {
          setBlogDetail(data);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogById();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!blogDetail)
    return <p className="text-center text-red-500">Blog not found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
        {blogDetail.blogTitle}
      </h1>
      <p className="text-gray-600 mb-[50px]">
        Posted on {new Date(blogDetail.createdAt).toLocaleDateString()}
      </p>
      <img
        src={blogDetail.product?.image}
        alt={blogDetail.blogTitle}
        className="w-2/3 mx-auto mb-[100px]"
      />
      <p className="text-gray-800 leading-relaxed">{blogDetail.blogContent}</p>
    </div>
  );
}
