module.exports = async () => {
  // add loop if you need multi account publish per platform
  let social = await strapi.services.social.findOne({
    platform: "twitter"
  });
  if (social.enable === false) {
    return { status: "social publish for twitter is disabled" };
  }
  let quotes;

  quotes = await strapi.services.quote.find({
    approved: true,
    _sort: "updatedAt:desc"
  });
  /* make sure there is at least one approved,not published quote  */
  if (Array.isArray(quotes) && quotes.length >= 1) {
    {
      let socialQuotesIds = social.quotes.map(q => q.id);
      let quote = quotes.find(quote => !didPublished(quote, socialQuotesIds));
      if (typeof quote !== "object") {
        return { status: "all quotes are published !" };
      }
      let tweeted = await strapi.api.social.helper.twitter.index(quote.text);
      if (tweeted !== true) {
        return { status: "tweet failed" };
      } else {
        entity = await strapi.services.social.update(
          { id: social.id },
          {
            quotes: [...socialQuotesIds, quote.id]
          }
        );
        return { status: "publish successfully" };
      }
    }
  } else {
    return { status: "Not Found" };
  }
};
const didPublished = (quote, publishedQuotes) => {
  return publishedQuotes.some(
    (publishedQuoteId, index) => quote.id === publishedQuoteId
  );
};
