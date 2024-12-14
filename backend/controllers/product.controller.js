import Product from "../model/product.model.js";
import User from "../model/user.models.js";

// create new product
export const createProduct = async (req, res) => {
    const { userId, categoryId, productName, productDescription, productPrice, image } = req.body;

    // Validate required fields
    if (!userId || !categoryId || !productName || !productDescription || productPrice === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newProduct = await Product.create({
            userId,
            categoryId,
            productName,
            productDescription,
            productPrice,
            image, // Include image if provided
        });
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Lấy tất cả các sản phẩm (bao gồm cả sản phẩm không hoạt động)
export const getAllProductsOrigin = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: User,
                attributes: ['userId', 'username'],
            },
        });
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Lấy tất cả các sản phẩm 
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isActive: 'active' }, // Thêm điều kiện để lấy sản phẩm có isActive là true
            include: {
                model: User,
                attributes: ['userId', 'username'],
            },
        });
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy sản phẩm theo ID 
export const getProductById = async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const product = await Product.findOne({
            where: { productId },
            include: {
                model: User,
                attributes: ['userId', 'username'],
            },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { userId, productName, productDescription, productPrice, isActive, image } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    if (isActive && !['active', 'inActive', 'waiting'].includes(isActive)) {
        return res.status(400).json({ message: 'Invalid value for isActive' });
    }

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update({
            userId: userId !== undefined ? userId : product.userId,
            productName: productName !== undefined ? productName : product.productName,
            productDescription: productDescription !== undefined ? productDescription : product.productDescription,
            productPrice: productPrice !== undefined ? productPrice : product.productPrice,
            isActive: isActive !== undefined ? isActive : product.isActive,
            image: image !== undefined ? image : product.image,
        });

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật trạng thái active của sản phẩm
export const updateProductActiveStatus = async (req, res) => {
    const { productId } = req.params;
    const { isActive } = req.body;

    if (isActive && !['active', 'inActive', 'waiting'].includes(isActive)) {
        return res.status(400).json({ message: 'Invalid value for isActive' });
    }

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.update({ isActive });

        res.status(200).json({ message: 'Product active status updated successfully', product });
    } catch (err) {
        console.error('Error updating product active status:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
