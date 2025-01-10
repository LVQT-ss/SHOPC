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


// Update user profile
async function updateUserProfile(userId, userData) {
	try {
		const response = await api.put(`/user/update/${userId}`, userData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error updating profile");
	}
}

// Update user profile picture
async function updateProfilePicture(userId, imageUrl) {
	try {
		const response = await api.patch(`/user/update-picture/${userId}`,
			{ profilePicture: imageUrl },
			{ headers: getHeader() }
		);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error updating profile picture");
	}
}

// Delete user account
async function deleteUserAccount(userId) {
	try {
		const response = await api.delete(`/user/delete/${userId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error deleting account");
	}
}


async function getAllUsers() {
	try {
		const response = await api.get("/user/getalluser", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching all users");
	}
}

async function getAllStaff() {
	try {
		const response = await api.get("/user/getallstaff", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching staff users");
	}
}

async function getAllCustomers() {
	try {
		const response = await api.get("/user/getallcustomer", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching customer users");
	}
}

async function getUserById(userId) {
	try {
		const response = await api.get(`/user/${userId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(`Error fetching user: ${error.message}`);
	}
}

async function updateUser(userId, userData) {
	try {
		const response = await api.put(`/user/update/${userId}`, userData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error updating user");
	}
}

async function deleteUser(userId) {
	try {
		const response = await api.delete(`/user/delete/${userId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || "Error deleting user");
	}
}

// Transaction APIs
async function createTransaction(transactionData) {
	try {
		const response = await api.post("/transactions/create", transactionData, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data || "Error creating transaction");
	}
}

async function getAllTransactions() {
	try {
		const response = await api.get("/transactions/all", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching transactions");
	}
}

async function getTransactionById(transactionId) {
	try {
		const response = await api.get(`/transactions/${transactionId}`, {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error(`Error fetching transaction: ${error.message}`);
	}
}

async function getDailyTransactions() {
	try {
		const response = await api.get("/transactions/daily", {
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching daily transactions");
	}
}

async function getTransactionsByDateRange(startDate, endDate) {
	try {
		const response = await api.get("/transactions/range", {
			params: { startDate, endDate },
			headers: getHeader()
		});
		return response.data;
	} catch (error) {
		throw new Error("Error fetching transactions by date range");
	}
}
export {
	// Auth exports
	register,
	login,
	requestPasswordReset,
	resetPassword,
	signout,
	updateUserProfile,
	updateProfilePicture,
	deleteUserAccount,
	//user exports 
	getAllUsers,
	getAllStaff,
	getAllCustomers,
	getUserById,
	updateUser,
	deleteUser,
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
	deleteProduct,

	//Transaction 
	createTransaction,
	getAllTransactions,
	getTransactionById,
	getDailyTransactions,
	getTransactionsByDateRange

};