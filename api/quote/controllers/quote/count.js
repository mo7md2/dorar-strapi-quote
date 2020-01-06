const { sanitizeEntity } = require("strapi-utils");

module.exports = async ctx => {
  /**
   * Count records.
   *
   * @return {Number}
   */

  if (ctx.query._q) {
    return sanitizeEntity(strapi.services.quote.countSearch(ctx.query));
  }
  return sanitizeEntity(strapi.services.quote.count(ctx.query));
};
