const _ = require("lodash");

async function crawlStores(storeInfos) {
  const responses = await Promise.all(
    storeInfos.map(async crawlInfo => {
      const { getProducts, storeName } = crawlInfo;

      console.log(`Getting prodcuts from ${storeName}`);
      const products = await getProducts();
      console.log(`Success getting products from ${storeName}`);
      return products;
    })
  );

  return _.flatten(responses).map(product => ({
    ...product,
    timestamp: new Date().toString()
  }));
}

exports.crawlStores = crawlStores;
