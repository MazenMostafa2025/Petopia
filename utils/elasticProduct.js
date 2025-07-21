const elasticClient = require('../utils/elasticsearch');

// Index a product in Elasticsearch
async function indexProduct(product) {
  try {
    await elasticClient.index({
      index: 'products',
      id: product._id.toString(),
      document: {
        name: product.name,
        type: product.type,
        category: product.category,
        description: product.description,
        image: product.image,
        quantity: product.quantity,
        gender: product.gender,
        age: product.age,
        breed: product.breed,
        price: product.price,
      },
    });
  } catch (err) {
    console.error('Elasticsearch index error:', err);
  }
}

// Remove a product from Elasticsearch
async function deleteProductFromIndex(id) {
  try {
    await elasticClient.delete({
      index: 'products',
      id: id.toString(),
    });
  } catch (err) {
    // Ignore not found errors
    if (err.meta && err.meta.statusCode !== 404) {
      console.error('Elasticsearch delete error:', err);
    }
  }
}

module.exports = { indexProduct, deleteProductFromIndex };
