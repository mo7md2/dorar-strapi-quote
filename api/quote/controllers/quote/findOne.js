const { sanitizeEntity } = require("strapi-utils");

module.exports = async ctx => {
    /**
   * Retrieve a record.
   *
   * @return {Object}
   */
  console.log('findOne')
  let entity = await strapi.services.quote.findOne(ctx.params);
  data =await strapi.api.quote.helper.fieldpermission(ctx,strapi.models.quote,entity)

  return sanitizeEntity(data);
};
