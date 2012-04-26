function doc(req, res, next) {
  res.render('docs/docs', {locals:{menu:'doc'}});
  next();
}

function routes() {
  return [
    {method:'get', path:"/docs", func:doc, role:"user"}
  ];
}
//===== PUBLIC ================================================================

module.exports = {
  routes: routes
};