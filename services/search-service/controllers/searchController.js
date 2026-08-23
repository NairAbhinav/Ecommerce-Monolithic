import Product from '../models/Product.js';

// @desc    Get all products (with search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 8;
    const page = Number(req.query.page) || 1;

    // Build query object
    const query = {};

    // 1. Search Query
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 2. Filters
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      query.brand = { $in: brands };
    }
    if (req.query.color) {
      query.color = { $regex: req.query.color, $options: 'i' };
    }
    if (req.query.ram) {
      query['specifications.ram'] = req.query.ram;
    }
    if (req.query.storage) {
      query['specifications.storage'] = req.query.storage;
    }
    if (req.query.os) {
      query['specifications.os'] = req.query.os;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // 3. Sorting
    let sort = {};
    if (req.query.sort) {
      if (req.query.sort === 'priceAsc') {
        sort = { price: 1 };
      } else if (req.query.sort === 'priceDesc') {
        sort = { price: -1 };
      } else if (req.query.sort === 'latest') {
        sort = { createdAt: -1 };
      } else if (req.query.sort === 'popular') {
        sort = { ratings: -1, reviewsCount: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // default sorting: latest
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SYNC ENDPOINTS =================

export const syncCreate = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncUpdate = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncDelete = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product synced deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
