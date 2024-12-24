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
async function signout() {
	try {
		localStorage.removeItem("token"); // Remove the token from localStorage
		return { success: true };
	} catch (error) {
		throw new Error("Signout failed");
	}
}


// Auth APIs
async function register(userData) {
	try {
		const response = await api.post("/auth/register", userData);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Registration failed");
	}
}

async function login(credentials) {
	try {
		const response = await api.post("/auth/login", credentials);
		localStorage.setItem("token", response.data.token);
		return response.data;
	} catch (error) {
		// Properly throw the error message from the server
		if (error.response && error.response.data) {
			throw new Error(error.response.data.message || error.response.data);
		}
		throw new Error("Network error. Please try again.");
	}
}

async function requestPasswordReset(email) {
	try {
		const response = await api.post("/auth/forgot-password", { email });
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Password reset request failed");
	}
}

async function resetPassword(token, newPassword) {
	try {
		const response = await api.post("/auth/reset-password", { token, newPassword });
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Password reset failed");
	}
}

// Order APIs
async function createOrder(orderData) {
	try {
		const response = await api.post("/orders/create", orderData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error creating order");
	}
}

async function getAllOrders() {
	try {
		const response = await api.get("/orders", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching orders");
	}
}

async function getActiveOrders() {
	try {
		const response = await api.get("/orders/active", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching active orders");
	}
}

async function getOrdersByUser() {
	try {
		const response = await api.get("/orders/user", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching user orders");
	}
}

async function getOrderById(orderId) {
	try {
		const response = await api.get(`/orders/${orderId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(`Error fetching order: ${error.message}`);
	}
}

async function updateOrder(orderId, orderData) {
	try {
		const response = await api.put(`/orders/${orderId}`, orderData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error updating order");
	}
}

async function deleteOrder(orderId) {
	try {
		const response = await api.delete(`/orders/${orderId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error deleting order");
	}
}

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
	// Auth exports
	register,
	login,
	requestPasswordReset,
	resetPassword,
	signout,

	// Order exports
	createOrder,
	getAllOrders,
	getActiveOrders,
	getOrdersByUser,
	getOrderById,
	updateOrder,
	deleteOrder,
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