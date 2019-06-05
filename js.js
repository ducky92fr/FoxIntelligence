const fs = require("fs");
const cheerio = require("cheerio");

class scrapeHtml {
  constructor() {
    this.finalResult = {
      status: "",
      result: {
        trips: [], //resultTrips will be pushed into this array
        custom: []
      }
    };
  }

  // //Trips
  // resultTrips = {
  //   code: "SNIKXP", //table2
  //   name: "dupont", //table1
  //   details: {
  //     price: 768.5, // table3
  //     roundTrips: []
  //   }
  // };

  // detailsRoundTrips = {
  //   type: "Aller", //table1
  //   date: "2016-09-02 00:00:00.000Z", //table1
  //   trains: [] //detailsTrain will be pushed into this array
  // };

  // detailsTrain() {
  //   departureTime: "16:57", //table1
  //   departureStation: "PARIS GARE DE LYON", //table1
  //   arrivalTime: "18:56", //table1
  //   arrivalStation: "LYON PART DIEU", //table1
  //   type: "TGV", //table1
  //   number: "6687" //table1
  //   passenger:"" //table1
  // };

  //custom

  startScrape(fileName) {
    this.htmlContent = fs.readFileSync(__dirname + `/html/${fileName}`, "utf8");
    const $ = cheerio.load(this.htmlContent);
    this.customPrices($);
  }

  customPrices($) {
    //find trip price
    const customPrices = [];
    $(".product-header > tbody >tr").each((i, currEl) => {
      const result = $(currEl)
        .children()
        .last()
        .text();
      customPrices.push({ value: result });
    });

    //find cartePrice
    const cartePrice = $(".amount").text();
    cartePrice ? customPrices.push({ value: cartePrice }) : null;

    //return
    return (this.finalResult.result.custom.price = [...customPrices]);
  }
}

const abc = new scrapeHtml();
abc.startScrape("test.html");
console.log(abc.finalResult.result.custom.price);
