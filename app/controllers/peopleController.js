var PeopleHelper = require('../helpers/peopleHelper'),
    Logger = require('nlogger').logger(module);

/**
  Show Search page
*/
function showSearch(req, res, next) {
  res.render('people/people', {locals:{menu:'search'}});
  next();
}


/**

*/
function search(req, res, next) {
  // gather search options
  var options = {keywords:req.query.keywords, start:0, count:100};
  ['start','count'].forEach(function(key) {
    if (req.query[key]) options[key] = parseInt(req.query[key])
  });
  options.fields = ":(people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,relation-to-viewer:(distance,num-related-connections)))"
  // search
  PeopleHelper.search(req, options, function(err, data) {
    if (err) {
      Logger.error(err);
      res.render('people/_peopleResults', {layout:false, locals:{error:JSON.stringify(err)}});
    } else {
      Logger.info(data);
      res.render('people/_peopleResults', {layout:false, locals:{people:data}});
    }
    next();
  });
}


function show(req, res, next) {
  var options = {id:req.params.id, authToken:req.query.authToken};
  options.fields = PeopleHelper.profileFields(req, req.params.id);
  // search
  PeopleHelper.profile(req, options, function(err, person) {
    if (err) {
      Logger.error(err);
      res.render('people/_profile', {layout:false, locals:{error:JSON.stringify(err)}});
    } else {
      res.render('people/_profile', {layout:false, locals:{person:person}});
    }
    next();
  });
}


// ===== Routes ===================================================================================

function routes() {
  return [
    {method:'get', path:"/people", func:showSearch, role:"user"},
    {method:'get', path:"/people/search", func:search, role:"user", partial:true},
    {method:'get', path:"/people/:id", func:show, role:"user", partial:true}
  ];
}
//===== PUBLIC ================================================================

module.exports = {
  routes: routes
};
