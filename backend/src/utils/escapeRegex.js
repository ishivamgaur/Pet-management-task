// Mongo filters build RegExp objects straight from query params, so any
// regex metacharacter a user types would otherwise be interpreted as
// syntax. An unbalanced "(" throws and 500s the request, and a nested
// quantifier like (a+)+ is enough to hang the server. Escaping turns the
// value back into a literal string, which is what a search box means.
module.exports = function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};