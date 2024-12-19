import axios from "axios";

const api = axios.create({
	baseURL: "https://shopc-5tfn.onrender.com/api"
});

const getHeader = () => {
	const token = localStorage.getItem("token");
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json"
	};
};

// Category APIs
async function createCategory(categoryData) {
	try {
		const response = await api.post("/categories/createCategory", categoryData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error creating category");
	}
}

async function getAllCategories() {
	try {
		const response = await api.get("/categories/getAllCategories");
		return response.data;
	} catch (error) {
		throw new Error("Error fetching categories");
	}
}

async function getCategoryById(categoryId) {
	try {
		const response = await api.get(`/categories/getCategoryById/${categoryId}`);
		return response.data;
	} catch (error) {
		throw new Error(`Error fetching category: ${error.message}`);
	}
}

async function updateCategory(categoryId, categoryData) {
	try {
		const response = await api.put(`/categories/updateCategory/${categoryId}`, categoryData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error updating category");
	}
}

async function deleteCategory(categoryId) {
	try {
		const response = await api.delete(`/categories/deleteCategory/${categoryId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error deleting category");
	}
}

// Product APIs
async function createProduct(productData) {
	try {
		const response = await api.post("/products/createProduct", productData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error creating product");
	}
}

async function getAllProducts() {
	try {
		const response = await api.get("/products/getAllProducts");
		return response.data;
	} catch (error) {
		throw new Error("Error fetching products");
	}
}

async function getProductById(productId) {
	try {
		const response = await api.get(`/products/getProductById/${productId}`);
		return response.data;
	} catch (error) {
		throw new Error(`Error fetching product: ${error.message}`);
	}
}

async function updateProduct(productId, productData) {
	try {
		const response = await api.put(`/products/updateProduct/${productId}`, productData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error updating product");
	}
}

async function updateProductActiveStatus(productId, status) {
	try {
		const response = await api.patch(`/products/updateProductActiveStatus/${productId}`,
			{ isActive: status },
			{ headers: getHeader() }
		);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error updating product status");
	}
}

async function deleteProduct(productId) {
	try {
		const response = await api.delete(`/products/deleteProduct/${productId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error deleting product");
	}
}

export {
	// Category exports
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,

	// Product exports
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	updateProductActiveStatus,
	deleteProduct
};