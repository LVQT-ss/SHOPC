import React, { useState } from "react";
import { Button, TextInput, Select, FileInput, Alert } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { app } from "../firebase";

const categories = [
  {
    categoryId: 1,
    categoryName: "Combo Pc",
    categoryType: "Combo Pc",
  },
  {
    categoryId: 2,
    categoryName: "Bo mạch chủ",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 3,
    categoryName: "Bộ vi xử lý",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 4,
    categoryName: "RAM",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 5,
    categoryName: "Ổ cứng HDD",
    categoryType: "Lưu trữ",
  },
  {
    categoryId: 6,
    categoryName: "Ổ cứng SSD",
    categoryType: "Lưu trữ",
  },
  {
    categoryId: 7,
    categoryName: "Card đồ họa",
    categoryType: "Linh kiện chính",
  },
  {
    categoryId: 8,
    categoryName: "Nguồn điện PSU",
    categoryType: "Linh kiện hỗ trợ",
  },
  {
    categoryId: 10,
    categoryName: "Ổ đĩa quang",
    categoryType: "Phụ kiện",
  },
  {
    categoryId: 11,
    categoryName: "Card mạng",
    categoryType: "Linh kiện kết nối",
  },
  {
    categoryId: 12,
    categoryName: "Vỏ máy tính",
    categoryType: "Phụ kiện",
  },
  {
    categoryId: 9,
    categoryName: "CPU Fan",
    categoryType: "Linh kiện hỗ trợ",
  },
];

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    categoryId: "",
    productName: "",
    productDescription: "",
    productPrice: "",
    isActive: "",
    image: null,
  });

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const navigate = useNavigate();

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
      const response = await fetch("/api/products/createProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setPublishError(data.message || "Failed to create product");
        return;
      }

      navigate("/products"); // Adjust route as needed
      setPublishError(null);
    } catch (error) {
      setPublishError("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Create a Product
      </h1>
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
          <Select id="categoryId" onChange={handleInputChange} required>
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

        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}

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
    </div>
  );
};

export default CreateProduct;
