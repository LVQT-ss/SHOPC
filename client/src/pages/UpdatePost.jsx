import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../Utils/ApiFunctions";
import { toast } from "react-toastify";

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

export default function UpdaetPost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    isActive: "",
    image: "",
  });
  const [publishError, setPublishError] = useState(null);
  const { postId } = useParams(); // Changed from productId to postId to match your route
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(postId);
        if (data) {
          setFormData({
            productName: data.productName || "",
            productDescription: data.productDescription || "",
            productPrice: data.productPrice || "",
            isActive: data.isActive || "active",
            image: data.image || "",
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setPublishError("Error fetching product. Please try again later.");
      }
    };

    if (postId) {
      fetchProduct();
    }
  }, [postId]);

  const handleUpdloadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
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
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "categoryId" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        productPrice: parseFloat(formData.productPrice),
      };

      await updateProduct(postId, updateData);
      toast.success("Product updated successfully!");
      navigate("/dashboard?tab=posts");
    } catch (error) {
      console.error("Update error:", error);
      setPublishError(error.message || "Failed to update product");
      toast.error(error.message || "Failed to update product");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Update Product
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
            value={formData.productName}
          />
        </div>

        <TextInput
          type="text"
          placeholder="Product Description"
          required
          id="productDescription"
          onChange={handleInputChange}
          value={formData.productDescription}
        />

        <TextInput
          type="number"
          placeholder="Product Price"
          required
          id="productPrice"
          step="0.01"
          onChange={handleInputChange}
          value={formData.productPrice}
        />

        <Select
          id="isActive"
          onChange={handleInputChange}
          value={formData.isActive}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
            onClick={handleUpdloadImage}
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
          Update Product
        </Button>

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
