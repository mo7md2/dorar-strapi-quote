const { sanitizeEntity } = require("strapi-utils");

module.exports = async ctx => {
/**
 * Retrieve records.
 *
 * @return {Array}
 */
  let entities;
  if (ctx.query._q) {
    entities = await strapi.services.quote.search(ctx.query);
  } else {
    entities = await strapi.services.quote.find(ctx.query);
  }
  data =await strapi.api.quote.helper.fieldpermission(ctx,strapi.models.quote,entities)
  return sanitizeEntity(data)
};
