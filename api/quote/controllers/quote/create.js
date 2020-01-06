/**
 * Retrieve records.
 *
 * @return {Array}
 */
const { sanitizeEntity } = require("strapi-utils");

module.exports = async ctx => {
  /**
   * Create a record.
   *
   * @return {Object}
   */
  let entity;
  if (ctx.is('multipart')) {
    const { data, files } = parseMultipartData(ctx);
    entity = await strapi.services.quote.create(data, { files });
  } else {
    let data =await strapi.api.quote.helper.fieldpermission(ctx,strapi.models.quote,ctx.request.body)
    entity = await strapi.services.quote.create(data);
  }
  return sanitizeEntity(entity, { model: strapi.models.quote });
};
