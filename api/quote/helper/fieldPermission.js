"use strict";

/**
 * `fieldPermission`.
 */

/**
 * create new role 'administrator'   from http://localhost:1337/admin/plugins/users-permissions/roles with name = 'Administrator'
 * create relation field between YourModel and User with name='owner' for owner permission
 * in 'yourModel.settings.json' inside attributes>field add "permission":"administrator"
 * available permissions =>
 * [
 *   'administrator',allow only [administrator],
 *   'owner', allow [administrator, owner] ,
 *   'authenticated',allow [administrator,owner, authenticated]
 *   'public', allow [administrator,owner, authenticated ,public ]
 * ]
 *
 * 1-check if get requested user permission type ['administrator'|'authenticated'|'public']
 * 2-delete fields from [request,response] that has permission higher than requested user permission
 * permission {String} = one of available permissions
 */

module.exports = async (ctx, model, data = null) => {
  let reqPermission = null,
    reqUserId = null;
  const fieldsWithPermission = getFieldsWithPermission(model);
  let errMsg = "You are not allowed to perform this action.";

  if (reqPermission === null) {
    let reqUser = getReqPermission(ctx);
    reqPermission = reqUser.reqPermission;
    reqUserId = reqUser.reqUserId;
  }
  // data handling
  if (Array.isArray(data)) {
    // [find]
    return data.map(entity => {

      filleterFields(
        ctx.request.method,
        entity,
        fieldsWithPermission,
        reqPermission,
        reqUserId
      );
      return entity;
    });
    // [findOne,create,update]
  } else if (typeof data === "object" && data !== null) {


    filleterFields(
      ctx.request.method,
      data,
      fieldsWithPermission,
      reqPermission,
      reqUserId
    );
    return data;
  }

  return ctx.unauthorized(errMsg);
};

// ====================================================

var getReqPermission = ctx => {
  /**
   * return [administrator|authenticated|public]
   * to check [owner] data is required
   */
  // check for [administrator|authenticated]
  if (
    typeof ctx.state.user !== "undefined" &&
    ctx.state.user !== null &&
    typeof ctx.state.user.id !== "undefined" &&
    ctx.state.user.id !== null
  ) {
    const { id, role } = ctx.state.user;
    if (role.type === "administrator") {
      return { reqPermission: "administrator", reqUserId: id };
    } else if (role.type === "authenticated") {
      return { reqPermission: "authenticated", reqUserId: id };
    }
  }
  // no condition matched return default [public]
  return { reqPermission: "public", reqUserId: null };
};
// ====================================================

var filleterFields = (
  reqMethod,
  entity,
  fieldsWithPermission,
  reqPermission,
  reqUserId
) => {
  console.log("fieldsWithPermission", fieldsWithPermission);

  if (Array.isArray(fieldsWithPermission) && fieldsWithPermission.length >= 1) {
    fieldsWithPermission.forEach(fieldWithPer => {
      // console.log('entity: ',entity);
      console.log("fieldWithPer", fieldWithPer);
      console.log("reqPermission", reqPermission);
      // control what data return to the api

      // fieldPermission = administrator ? delete field if reqPermission in ['administrator', 'authenticated' ,'public'] =>delete field for any thing but ['administrator']
      // fieldPermission = owner ? delete field if reqPermission in ['# authenticated' ,'public'] #owner is authenticated so must check for entity ownership
      // fieldPermission = authenticated ? delete field if reqPermission in ['public']
      // fieldPermission = public ? delete field if reqPermission in [] => delete non =>allow all

      if (
        (reqMethod !== "POST",
        entity.hasOwnProperty("owner") &&
          fieldWithPer.fieldPermission === "owner" &&
          !isOwner(entity, reqUserId, reqPermission))
      ) {
        deleteFields(entity, fieldWithPer);
      } else if (fieldWithPer.fieldPermission === "administrator") {
        if (reqPermission !== "administrator") {
          deleteFields(entity, fieldWithPer);
        }
      } else if (fieldWithPer.fieldPermission === "authenticated") {
        if (reqPermission === "public") {
          deleteFields(entity, fieldWithPer);
        }
      }
    });
  }
  return entity;
};
// ====================================================

var getFieldsWithPermission = model => {
  let arr = [];
  for (let fieldName in model.allAttributes) {
    if ("permission" in model.allAttributes[fieldName]) {
      arr.push({
        fieldName,
        fieldPermission: model.allAttributes[fieldName].permission
      });
    }
  }
  return arr;
};
// ====================================================

var deleteFields = (entity, fieldWithPer) => {
  for (let resFieldName in entity) {
    if (resFieldName === fieldWithPer.fieldName) {
      delete entity[resFieldName];
    }
  }
};
// ====================================================
var isOwner = (entity, reqUserId, reqPermission) => {
  console.log("isOwner");
  // check for entity ownership
  // administrator has access
  if (reqPermission === "administrator") {
    return true;
  }
  // public not allowed
  if (reqPermission !== "authenticated" || reqUserId === null) {
    return false;
  }
  if (
    typeof entity.owner !== "undefined" &&
    entity.owner !== null &&
    ((typeof entity.owner.id !== "undefined" &&
      entity.owner.id !== null &&
      entity.owner.id.toString() === reqUserId.toString()) ||
      entity.owner === reqUserId)
  ) {
    return true;
  }
  //  authenticated but id does not match
  return false;
};
