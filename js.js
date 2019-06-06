const fs = require("fs");
const cheerio = require("cheerio");

class scrapeHtml {
  constructor() {
    this.finalResult = {
      status: "",
      result: {
        trips: [],
        custom: {}
      }
    };
  }

  startScrape(htmlFile, jsonFile) {
    //read File and load to cheerio
    const htmlContent = fs.readFileSync(
      __dirname + `/html/${htmlFile}`,
      "utf8"
    );
    const $ = cheerio.load(htmlContent);
    this.customPrices($);
    this.detailsRoundTrips($);

    //Convert to JSON and write the file
    const json = JSON.stringify(this.finalResult);
    fs.writeFileSync(__dirname + `/json/${jsonFile}`, json);
  }

  resultTrips($, roundTrips) {
    //code
    const code = $(
      "#block-travel .digital-box-cell > .block-pnr .pnr-ref .pnr-info"
    ).text();
    //name
    const name = $(
      "#block-travel .digital-box-cell > .block-pnr .pnr-name .pnr-info"
    ).text();
    //price
    const totalPrice = $(
      "#block-payment .digital-box-cell > .total-amount .very-important"
    ).text();
    const trips = {
      code: code,
      name: name,
      details: {
        price: totalPrice,
        roundTrips: roundTrips
      }
    };
    return this.finalResult.result.trips.push(trips);
  }

  detailsRoundTrips($) {
    const roundTrips = [];
    $(".product-details").each((i, el) => {
      const date = $(el)
        .prev()
        .find($(".product-travel-date"))
        .text();
      const direction = $(el)
        .find($(".travel-way"))
        .text();
      const departureTime = $(el)
        .find($(".origin-destination-hour.segment-departure"))
        .text();
      const departureStation = $(el)
        .find($(".origin-destination-station.segment-departure"))
        .text();
      const arrivalTime = $(el)
        .find($(".origin-destination-hour.segment-arrival"))
        .text();
      const arrivalStation = $(el)
        .find($(".origin-destination-station.segment-arrival"))
        .text();
      const typeTrain = $(el)
        .find($(".segment"))
        .first()
        .text();
      const idTrain = $(el)
        .find($(".segment"))
        .first()
        .next()
        .text();
      const roundTrip = {
        type: direction,
        date: date,
        trains: {
          departureTime: departureTime,
          departureStation: departureStation,
          arrivalTime: arrivalTime,
          arrivalStation: arrivalStation,
          type: typeTrain,
          number: idTrain
        }
      };
      roundTrips[i] = roundTrip;
    });
    this.resultTrips($, roundTrips);
  }
  customPrices($) {
    //find trip price then loop through array
    const custom = [];
    $(".product-header > tbody >tr").each((i, currEl) => {
      const result = $(currEl)
        .children()
        .last()
        .text();
      custom.push({ value: result });
    });

    //find cartePrice
    const cartePrice = $(".amount").text();
    cartePrice ? custom.push({ value: cartePrice }) : null;

    //return
    return (this.finalResult.result.custom.prices = custom);
  }
}

const abc = new scrapeHtml();
abc.startScrape("test.html", "test.json");
