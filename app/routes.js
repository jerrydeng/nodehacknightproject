var Util = require('util'),
    SessionController = require('./controllers/sessionController'),
    Logger = require('nlogger').logger(module);

// ===== Before/After filter definitions ==========================================================


/**
  Return function for method chain:  start request timer.  Initialze various things in request object
*/
function beforeFilter(config) {
  var result = function(req, res, next) {
    // start now
    req.startTime = Date.now();
    
    // collect info about request
    if (config.controller != 'session') {
      if (req.query) { config.query = req.query}
      if (req.body) {config.body = req.body}
    } else if (req.body && req.body.username) {
      config.username = req.body.username;
    } else if (req.query && req.query.username) {
      config.username = req.query.username;
    }
    // log request entry
    Logger.debug("Request: " + Util.inspect(config));
    req.routeConfig = config;
    
    next();
  };
  return result;
}


/**
  Log MobileServer request
*/
function logAPIRequest(req, res, next) {
  // stop timer
  var total = Date.now() - req.startTime;
  var logLine = 'API: ' + req.connection.remoteAddress + ' "' + req.method + ' ' + req.originalUrl
    + '" ' + res.statusCode + ' ' + res.output.length + ' ' + total + 'ms';
  Logger.info(logLine);
  next()
}


/**
  End the method filter chain by doing nothing
*/
function finalFilter(req, res, next) {
  // do nothing
}


// ===== Route Definition =========================================================================
/**
 For each controller named x, we're loading app/controllers/xController, and
 expecting it to export routes function, returning the array of routes.
*/
var ControllerRoutes = [{name:"session", pathPrefix:""},
                        {name:"people", pathPrefix:""},
                        {name:"doc", pathPrefix:""}];


/**
  Build routes for defined controllers and attach them to provided app.
  Return a list of routes that were created.
*/
function buildControllerRoutes(app) {
  var routeSummary = [];
  ControllerRoutes.forEach(function(cr){
    var method, path, currentUserFunc;
    // for each controller's routes
    require('./controllers/' + cr.name + 'Controller').routes().forEach(function(route) {
      // determine path
      method = route.method || 'get';
      path = cr.pathPrefix ? cr.pathPrefix + route.path : route.path;
      routeSummary.push(method + " " + path);
      // determine user role
      switch(route.role) {
        case 'guest':  currentUserFunc = SessionController.guestUser; break;
        default: currentUserFunc = SessionController.currentUser; break;
      }
      // capture config info
      var config = {path:path, controller:cr.name, action:route.func.name};
      if (route.partial) config.partial = route.partial;
      // attach the method/path route to this method chain
      app[method](path, beforeFilter(config),
                        currentUserFunc,
                        route.func,
                        logAPIRequest,
                        finalFilter);
    });
  });
  return routeSummary;
}


// ===== PUBLIC ===================================================================================

module.exports = {
  buildControllerRoutes: buildControllerRoutes
};
