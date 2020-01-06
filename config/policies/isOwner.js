"use strict";

/**
 * `isOwner` policy.
 */
// "global.isOwner"
var pluralize = require("pluralize");

module.exports = async (ctx, next, args) => {
  let errMsg = "You are not allowed to perform this action.";

  //   if there is no user (authorization not provided) return unauthorized
  if (
    typeof ctx.state.user === "undefined" ||
    ctx.state.user === null ||
    typeof ctx.state.user.id === "undefined" ||
    ctx.state.user.id === null
  ) {
    return ctx.unauthorized(`${errMsg} [0]`);
  }
  const { id, role } = ctx.state.user;
  if (role.type !== "administrator") {
    // Remove everything about owner in the query eg. owner.id_in, owner.id, owner etc.

    // [find, count] Only query entities that owned by the current user
    if (ctx.request.method === "GET") {
      for (let key in ctx.query) {
        if (key.includes("owner")) {
          delete ctx.query[key];
        }
      }

      // Reset owner to current user id
      ctx.query = Object.assign({ owner: id }, ctx.query);
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
      typeof existingEntity.owner === "undefined" ||
      existingEntity.owner === null ||
      typeof existingEntity.owner.id === "undefined" ||
      existingEntity.owner.id === null ||
      existingEntity.owner.id.toString() !== id.toString()
    ) {
      return ctx.unauthorized(`${errMsg} [2]`);
    }

    // Set owner to current user
    ctx.request.body.owner = id.toString();
  }
  await next();
//   delete ctx.response.body.text
//   console.log('response body',ctx.response.body)
    let modelName = ctx.request.path.match(/^\/([^\/]*)\/?.*$/);
  //   console.log(modelName[1])
  // console.log('strapi.models.quote.apiName',(strapi.models.quote.apiName))
  // console.log('strapi.models.quote.modelName',(strapi.models.quote.modelName))

  // console.log('strapi.api.quote.models.quote.allAttributes.text',Object.keys(strapi.models.quote.allAttributes.text))
  // console.log('strapi.api.quote.config.routes',(strapi.api.quote.config.routes[0]))



  // [find.one] Only query entities that owned by the current user
  if (ctx.request.method === "GET") {
    if (ctx.params.id) {
      if (ctx.response.body!==null && typeof ctx.response.body !=="undefined" && ctx.response.body.owner.id !== id && role.type !== "administrator") {
        return ctx.unauthorized("You are not allowed to perform this action.");
      }
    }
  }
};
