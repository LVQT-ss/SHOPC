import React, { useState, useEffect } from "react";
import { Button, TextInput, Select, FileInput, Alert } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { app } from "../firebase";
import { createProduct, getAllCategories } from "../Utils/ApiFunctions";

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    categoryId: "",
    productName: "",
    productDescription: "",
    productPrice: "",
    isActive: "active", // Default value
    image: null,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }

      const storage = getStorage(app);
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData((prev) => ({ ...prev, image: downloadURL }));
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert categoryId to a number
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
      };

      await createProduct(productData);
      toast.success("Product created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/dashboard?tab=posts");
      setPublishError(null);
    } catch (error) {
      setPublishError(error.message || "Something went wrong");
      toast.error(error.message || "Failed to create product", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error(error);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Create a Product
      </h1>

      {loading ? (
        <div className="text-center">Loading categories...</div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 sm:flex-row justify-between">
            <TextInput
              type="text"
              placeholder="Product Name"
              required
              id="productName"
              className="flex-1"
              onChange={handleInputChange}
            />
            <Select
              id="categoryId"
              onChange={handleInputChange}
              value={formData.categoryId}
              required
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName} ({category.categoryType})
                </option>
              ))}
            </Select>
          </div>

          <TextInput
            type="text"
            placeholder="Product Description"
            required
            id="productDescription"
            onChange={handleInputChange}
          />

          <TextInput
            type="number"
            placeholder="Product Price"
            required
            id="productPrice"
            step="0.01"
            onChange={handleInputChange}
          />

          <Select
            id="isActive"
            onChange={handleInputChange}
            value={formData.isActive}
          >
            <option value="active">Active</option>
            <option value="inActive">Inactive</option>
          </Select>

          <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
            <FileInput
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type="button"
              gradientDuoTone="purpleToBlue"
              size="sm"
              outline
              onClick={handleImageUpload}
              disabled={imageUploadProgress}
            >
              {imageUploadProgress ? (
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress || 0}%`}
                  />
                </div>
              ) : (
                "Upload Image"
              )}
            </Button>
          </div>

          {imageUploadError && (
            <Alert color="failure">{imageUploadError}</Alert>
          )}

          {formData.image && (
            <img
              src={formData.image}
              alt="Product"
              className="w-full h-72 object-cover"
            />
          )}

          <Button type="submit" gradientDuoTone="purpleToPink">
            Create Product
          </Button>

          {publishError && (
            <Alert className="mt-5" color="failure">
              {publishError}
            </Alert>
          )}
        </form>
      )}
    </div>
  );
};

export default CreateProduct;
