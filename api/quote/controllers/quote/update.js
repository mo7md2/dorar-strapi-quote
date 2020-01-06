
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = async ctx => {
    /**
   * Update a record.
   *
   * @return {Object}
   */
  let entity;
  if (ctx.is('multipart')) {
    const { data, files } = parseMultipartData(ctx);
    entity = await strapi.services.quote.update(ctx.params, data, {
      files,
    });
  } else {
    let data =await strapi.api.quote.helper.fieldpermission(ctx,strapi.models.quote,ctx.request.body)
    entity = await strapi.services.quote.update(
      ctx.params,
      data
    );
  }

  return sanitizeEntity(entity, { model: strapi.models.quote });
};
