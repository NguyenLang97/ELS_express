const { Client } = require('@elastic/elasticsearch');
const client = new Client({
  node: process.env.ELASTIC_URI,
  auth: {
    username: process.env.ELASTIC_USERNAME, // Set environment variables
    password: process.env.ELASTIC_PASSWORD, // for security
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Index a document
async function indexProduct(product) {
  await client.index({
    index: 'products',
    id: product._id.toString(),
    body: {
      name: product.name,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
    },
  });
}

// Search for products
async function searchProducts(query) {
  // Lọc các trường hợp query không hợp lệ
  const validQueries = Object.keys(query).filter((key) => query[key]);
  if (validQueries.length === 0) {
    throw new Error('No valid query provided.');
  }

  // Tạo điều kiện `must` cho các trường hợp bắt buộc
  const mustConditions = validQueries.map((key) => ({
    match: {
      [key]: {
        query: query[key],
        operator: 'and',
      },
    },
  }));

  const response = await client.search({
    index: 'products',
    body: {
      size: 100, // Giới hạn trả về 100 kết quả
      query: {
        bool: {
          should: mustConditions, // Thay bằng `should` nếu muốn bất kỳ điều kiện nào đúng
        },
      },
    },
  });

  console.log('🚀  body ==', response);
  return response.hits.hits;
}

async function updateProduct(productId, productData) {
  console.log('🚀  productData ==', productId, productData);
  if (!productId || !productData) {
    throw new Error('Invalid productId or productData');
  }
  // Remove _id field from productData if it exists
  const { _id, ...updateData } = productData;
  const response = await client.update({
    index: 'products',
    id: productId.toString(),
    body: {
      doc: updateData,
    },
  });
  return response;
}

// Get all products
// async function getAllProducts() {
//   const response = await client.search({
//     index: 'products',
//     body: {
//       size: 100,
//       query: {
//         match_all: {},
//       },
//     },
//   });

//   return response.hits.hits;
// }

// thêm Scroll Search API để lấy tất cả sản phẩm
async function scrollSearch(index, query) {
  const allResults = [];
  let response = await client.search({
    index: index,
    scroll: '1m',
    body: {
      query: query,
    },
  });
  console.log('🚀  response ==', response);

  while (response.hits.hits.length) {
    allResults.push(...response.hits.hits);
    response = await client.scroll({
      scroll_id: response._scroll_id,
      scroll: '1m',
    });
  }

  return allResults;
}

async function getAllProducts() {
  const index = 'products'; // replace with your actual index name
  const query = {
    match_all: {},
  };
  return await scrollSearch(index, query);
}

// Delete a document
async function deleteProduct(id) {
  await client.delete({
    index: 'products',
    id,
  });
}

module.exports = { indexProduct, searchProducts, deleteProduct, getAllProducts, updateProduct };
