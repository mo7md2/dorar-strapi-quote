const { sanitizeEntity } = require("strapi-utils");

module.exports = async ctx => {
    /**
   * delete a record.
   *
   * @return {Object}
   */
  const entity = await strapi.services.quote.delete(ctx.params);
  return sanitizeEntity(entity, { model: strapi.models.quote });
};
