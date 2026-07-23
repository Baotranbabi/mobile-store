const Category = require("../models/Category");

const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

module.exports = { getCategories };
