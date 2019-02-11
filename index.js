const cheerio = require("cheerio");

const { crawlStores } = require("./crawlStores");
const { checkForNewOffers } = require("./checkForNewOffers");
const { createNotificationsForOffers } = require("./notify");

const storeInfos = [
  {
    transformResponse: html => {
      const $ = cheerio.load(html);
      const sections = $(".inner-product");

      const products = [];
      sections.each((index, element) => {
        const id = element.attribs["data-id"];

        const url =
          "https://www.hgshop.hr/" + element.attribs["data-producturl"];

        const description = Object.entries({
          Name: element.attribs["data-name"],
          Brand: element.attribs["data-brand"],
          Price: element.attribs["data-price"],
          URL: url
        })
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        products.push({
          id,
          description,
          url
        });
      });

      return products;
    },

    requestOptions: {
      method: "POST",
      url: "https://www.hgshop.hr/AJAX/ProductList/productList.aspx",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      data: Object.entries({
        priceFrom: 5000,
        priceTo: 6200,
        "8899-878": "Intel+Core+i5-8300H+(8M+cache,+do+4.00+GHz)",
        gid: 473,
        pagination: 25,
        currPage: 1,
        sort: "cijena_mpc asc"
      })
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    }
  }
];

(async () => {
  const laptopOffers = await crawlStores(storeInfos);

  const newOffers = checkForNewOffers(laptopOffers);
  console.log("Number of new offers:", newOffers.length);

  createNotificationsForOffers(newOffers);
})();
