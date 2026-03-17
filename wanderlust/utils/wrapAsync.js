
module.exports = function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);             // = fn(req, res, next).catch((err) => next(err));
  }
}




// // we can also exports in this way:
// module.exports = (fn) => {
//   return function(req, res, next) {
//     fn(req, res, next).catch(next);
//   }
// }