"use strict";

/**
 * `setOwner` policy.
 */
var pluralize = require("pluralize");
module.exports = async (ctx, next) => {
  delete ctx.request.body.owner;

  if (
    typeof ctx.state.user !== "undefined" &&
    ctx.state.user !== null &&
    typeof ctx.state.user.id !== "undefined" &&
    ctx.state.user.id !== null
  ) {
    const { id } = ctx.state.user;
    const { body } = ctx.request;
    if (ctx.request.method === "POST") {
      body.owner = id.toString();
    }
  }
    // [update, delete] Check owner of an existing entity
    if (
      (ctx.request.method === "DELETE" || ctx.request.method === "PUT") &&
      typeof ctx.params !== "undefined" &&
      ctx.params !== null &&
      typeof ctx.params.id !== "undefined" &&
      ctx.params.id !== null &&
      ctx.params.id !== ""
    ) {
      // Extract model name from request path eg. /messages/15
      let modelName = ctx.request.path.match(/^\/(.*)\/.*$/);
      if (
        Array.isArray(modelName) === false ||
        modelName.length !== 2 ||
        modelName[1] === ""
      ) {
        return ctx.unauthorized(`Invalid request ${ctx.request.path}`);
      }
      // Get existing entity and check for ownership
      let existingEntity = await strapi
        .query(pluralize.singular(modelName[1]))
        .findOne({
          id: ctx.params.id
        });
      if (typeof existingEntity === "undefined" || existingEntity === null) {
        return ctx.notFound("Not Found");
      }
      if (
        typeof existingEntity.owner !== "undefined" &&
        existingEntity.owner !== null &&
        typeof existingEntity.owner.id !== "undefined" &&
        existingEntity.owner.id !== null
        ) {
          // Set owner to existingEntity.owner
          console.log('existingEntity.owner', existingEntity.owner.id.toString())
      ctx.request.body.owner = existingEntity.owner.id.toString();
      }
    }
  await next();
};
