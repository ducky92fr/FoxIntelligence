const fs = require("fs");
const cheerio = require("cheerio");
const { formatHour, formatMoney, formatDate } = require("./util/format");

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
    )
      .text()
      .trim();
    //name
    const name = $(
      "#block-travel .digital-box-cell > .block-pnr .pnr-name .pnr-info"
    )
      .text()
      .trim();
    //price
    const totalPrice = formatMoney(
      $(
        "#block-payment .digital-box-cell > .total-amount .very-important"
      ).text()
    );
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
    //get dates data
    let dates = [];
    const regex = /\d{2}.\d{2}.\d{4}/g;
    $("#block-travel div[id^=travel]").each((i, el) => {
      const date = $(el)
        .find($(".block-pnr .pnr-summary"))
        .text()
        .match(regex);
      dates = dates.concat(date);
    });

    //Create array direction to check when to push passenger Array into Object
    let travelWay = [];
    $(".product-details .travel-way").each((i, el) => {
      const direction = $(el)
        .text()
        .trim();
      travelWay[i] = direction;
    });

    //Roundtrips details
    const roundTrips = [];
    $(".product-details").each((i, el) => {
      const direction = $(el)
        .find($(".travel-way"))
        .text()
        .trim();
      const departureTime = formatHour(
        $(el)
          .find($(".origin-destination-hour.segment-departure"))
          .text()
      );
      const departureStation = $(el)
        .find($(".origin-destination-station.segment-departure"))
        .text()
        .trim();
      const arrivalTime = formatHour(
        $(el)
          .find($(".origin-destination-hour.segment-arrival"))
          .text()
      );
      const arrivalStation = $(el)
        .find($(".origin-destination-station.segment-arrival"))
        .text()
        .trim();
      const typeTrain = $(el)
        .find($(".segment"))
        .first()
        .text()
        .trim();
      const idTrain = $(el)
        .find($(".segment"))
        .first()
        .next()
        .text()
        .trim();

      //check if we should push passenger array into Aller or Retour direction
      let hasPassenger = null;
      direction === "Retour" ||
      (travelWay[i + 1] === "Aller" || !travelWay[i + 1])
        ? (hasPassenger = true)
        : (hasPassenger = false);

      //If hasPassenger is true then extract data to push into Object. If false dont do anything

      //Create roundTrip Object
      const roundTrip = {
        type: direction,
        date: formatDate(dates[i]),
        trains: [
          {
            departureTime: departureTime,
            departureStation: departureStation,
            arrivalTime: arrivalTime,
            arrivalStation: arrivalStation,
            type: typeTrain,
            number: idTrain,
            ...(hasPassenger ? { passenger: [1] } : false)
          }
        ]
      };
      roundTrips[i] = roundTrip;
    });
    this.resultTrips($, roundTrips);
  }

  //CustomPrices
  customPrices($) {
    //find trip price then loop through array
    const custom = [];
    $(".product-header > tbody >tr").each((i, el) => {
      const priceTravel = formatMoney(
        $(el)
          .children()
          .last()
          .text()
      );
      custom.push({ value: priceTravel });
    });

    //find cartePrice
    const cartePrice = formatMoney($(".amount").text());
    cartePrice ? custom.push({ value: cartePrice }) : null;

    return (this.finalResult.result.custom.prices = custom);
  }
}

const scrapeMachine = new scrapeHtml();
scrapeMachine.startScrape("test.html", "test.json");
