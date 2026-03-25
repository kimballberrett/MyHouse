// Craigslist search configuration.
// Change the baseUrl subdomain to target a different city
// (e.g. saltlakecity, slc, denver, losangeles, etc.)
module.exports = {
  baseUrl: "https://provo.craigslist.org/search/apa",
  params: {
    min_price: 300,
    max_price: 2500,
    availabilityMode: 0,
  },
};
