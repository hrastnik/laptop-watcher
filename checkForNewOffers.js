const path = require("path");
const fs = require("fs");

const PREV_OFFERS_FILEPATH = path.join(__dirname, ".lastoffers");

function getPreviousOffers() {
  try {
    const prevOffersRaw = fs.readFileSync(PREV_OFFERS_FILEPATH, {
      encoding: "utf8"
    });

    const prevOffers = JSON.parse(prevOffersRaw);

    if (!Array.isArray(prevOffers)) throw new Error("Corrupted .lastoffers");

    return prevOffers;
  } catch (error) {
    return [];
  }
}

function updatePreviousOffers(offers) {
  fs.writeFileSync(PREV_OFFERS_FILEPATH, JSON.stringify(offers, null, 2));
}

function checkForNewOffers(offers) {
  const prevOffers = getPreviousOffers();

  updatePreviousOffers(offers);

  const newOffers = offers.filter(offer => {
    const isOldOffer = prevOffers.some(o => o.id === offer.id);

    return !isOldOffer;
  });

  return newOffers;
}

exports.checkForNewOffers = checkForNewOffers;
