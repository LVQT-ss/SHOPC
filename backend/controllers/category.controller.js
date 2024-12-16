import Category from "../model/category.model.js";

// Create new category
export const createCategory = async (req, res) => {
    const { categoryName, categoryType } = req.body;

    // Validate required fields
    if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const newCategory = await Category.create({
            categoryName,
            categoryType,
        });
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId) {
        return res.status(400).json({ message: 'Category ID is required' });
    }

    try {
        const category = await Category.findOne({
            where: { categoryId },
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { categoryName, categoryType } = req.body;

    if (!categoryId) {
        return res.status(400).json({ message: 'Category ID is required' });
    }

    try {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.update({
            categoryName: categoryName !== undefined ? categoryName : category.categoryName,
            categoryType: categoryType !== undefined ? categoryType : category.categoryType,
        });

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) {
        return res.status(400).json({ message: 'Category ID is required' });
    }

    try {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.destroy();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ message: 'Server error' });
    }
};