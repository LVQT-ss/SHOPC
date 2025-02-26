import Blog from '../model/blog.model.js';
import Product from '../model/product.model.js';

// Tạo blog mới
export const createBlog = async (req, res) => {
    const { blogTitle, blogContent, productId, isActive } = req.body;

    if (!blogTitle || !blogContent || !productId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newBlog = await Blog.create({
            blogTitle,
            blogContent,
            productId,
            isActive,
        });
        res.status(201).json(newBlog);
    } catch (err) {
        console.error('Error creating blog:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy tất cả blog
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            include: [{ model: Product, as: 'product' }],
        });
        res.status(200).json(blogs);
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy blog theo ID
export const getBlogById = async (req, res) => {
    const { blogId } = req.params;
    try {
        const blog = await Blog.findOne({
            where: { blogId },
            include: [{ model: Product, as: 'product' }],
        });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (err) {
        console.error('Error fetching blog:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cập nhật blog
export const updateBlog = async (req, res) => {
    const { blogId } = req.params;
    const { blogTitle, blogContent, productId, isActive } = req.body;
    try {
        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        await blog.update({
            blogTitle: blogTitle !== undefined ? blogTitle : blog.blogTitle,
            blogContent: blogContent !== undefined ? blogContent : blog.blogContent,
            productId: productId !== undefined ? productId : blog.productId,
            isActive: isActive !== undefined ? isActive : blog.isActive,
        });
        res.status(200).json({ message: 'Blog updated successfully', blog });
    } catch (err) {
        console.error('Error updating blog:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Xóa blog
export const deleteBlog = async (req, res) => {
    const { blogId } = req.params;
    try {
        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        await blog.destroy();
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Error deleting blog:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
