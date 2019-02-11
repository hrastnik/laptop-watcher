const axios = require("axios");
const _ = require("lodash");

async function crawlStores(storeInfos) {
  const responses = await Promise.all(
    storeInfos.map(async crawlInfo => {
      const { requestOptions, transformResponse } = crawlInfo;

      console.log(`Now crawling ${requestOptions.url}`);
      const response = await axios(requestOptions).then(res => res.data);
      console.log(`Success crawling ${requestOptions.url}`);

      return transformResponse(response);
    })
  );

  return _.flatten(responses);
}

exports.crawlStores = crawlStores;
