const notifier = require("node-notifier");

function createNotificationsForOffers(offers) {
  offers.forEach(offer => {
    const { id, description, url } = offer;
    // name, price, brand, producturl } = laptop;

    notifier.notify(
      {
        title: `New Laptop Available! (${id})`,
        wait: true,
        message: description
      },
      (error, other) => {
        if (error) {
          console.log("Notify error:", error);
        }
      }
    );
  });
}

exports.createNotificationsForOffers = createNotificationsForOffers;
