const cheerio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");

const { crawlStores } = require("./crawlStores");
const { checkForNewOffers } = require("./checkForNewOffers");
const { createNotificationsForOffers } = require("./notify");

const storeInfos = [
  {
    storeName: "Instar Informatika",
    getProducts: async () => {
      const url =
        "https://www.instar-informatika.hr/query-artikli.asp?id=laptopi&man=&akcija=&novo=&izdvajamo=&opcije=&like=&min=5800&max=8000&filterword=&subf=&vrstaupita=1";
      const html = await axios
        .request({
          method: "GET",
          url
        })
        .then(res => res.data);

      const $ = cheerio.load(html);
      const products = $(".product");

      const relevantProducts = [];

      products.each((index, element) => {
        const $elem = $(element);
        const url = $elem.find(".main")[0].attribs["href"];
        const title = $elem.find(".name").text();

        const processor = $elem
          .find(".kljucna li")
          .eq(0)
          .text();

        const storage = $elem
          .find(".kljucna li")
          .eq(2)
          .text();

        const price = parseFloat(
          $elem
            .find(".price .numbers")
            .text()
            .replace(".", "")
            .replace(",", ".")
        );

        const isI5_8300 = processor.indexOf("8300") > -1;
        const isSSD = storage.toLowerCase().indexOf("ssd") > -1;
        const isPriceOK = price < 6200;

        const isRelevant = isI5_8300 && isSSD && isPriceOK;
        if (!isRelevant) return;

        const id = (() => {
          try {
            return $elem
              .find(".likebtndiv a")
              .first()
              .attr("onclick")
              .split("'")[1];
          } catch (error) {
            return (
              "No ID! Random: " +
              Math.random()
                .toString(16)
                .substr(2, 5)
            );
          }
        })();

        const description = [
          `Name: ${title}`,
          `Price: ${price}`,
          `URL: ${url}`
        ].join("\n");

        relevantProducts.push({
          id,
          description,
          url
        });
      });

      return relevantProducts;
    }
  },
  {
    storeName: "HGShop",
    getProducts: async () => {
      const html = await axios
        .request({
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
        })
        .then(res => res.data);

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
    }
  }
];

(async () => {
  const laptopOffers = await crawlStores(storeInfos);

  const newOffers = checkForNewOffers(laptopOffers);
  console.log("Number of new offers:", newOffers.length);

  createNotificationsForOffers(newOffers);
})();
