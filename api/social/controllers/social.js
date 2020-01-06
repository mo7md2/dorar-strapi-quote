"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // await strapi.api.social.helper.twitter.index('tw')
  async publish(ctx) {
console.log('publish controller')
let status = await strapi.api.social.helper.twitter.tweetquote();
ctx.send(status)

  }
};
