const express = require('express');
const Component = require('../models/Component');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public API to get component by part number
router.get('/components', optionalAuth, async (req, res) => {
  try {
    const { part, search, category, limit = 20 } = req.query;
    
    let query = {};
    
    if (part) {
      query.part_number = { $regex: part, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { component_name: { $regex: search, $options: 'i' } },
        { part_number: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const components = await Component.find(query)
      .select('component_name part_number description quantity location_bin unit_price category manufacturer_supplier datasheet_link')
      .limit(parseInt(limit))
      .sort({ component_name: 1 });
    
    res.json({
      components,
      count: components.length,
      api_version: '1.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public API error:', error);
    res.status(500).json({ 
      message: 'Error fetching components', 
      error: error.message 
    });
  }
});

// Public API to get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Component.distinct('category');
    const categoryCounts = await Component.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const categoriesWithCounts = categories.map(category => {
      const categoryData = categoryCounts.find(item => item._id === category);
      return {
        name: category,
        count: categoryData ? categoryData.count : 0
      };
    });

    res.json({
      categories: categoriesWithCounts,
      api_version: '1.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public categories API error:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// Public API stats
router.get('/stats', async (req, res) => {
  try {
    const totalComponents = await Component.countDocuments();
    const totalCategories = await Component.distinct('category').then(cats => cats.length);
    const lowStockCount = await Component.countDocuments({
      $expr: { $lte: ['$quantity', '$critical_low_threshold'] }
    });
    
    res.json({
      totalComponents,
      totalCategories,
      lowStockCount,
      api_version: '1.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Public stats API error:', error);
    res.status(500).json({ 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
});

module.exports = router;