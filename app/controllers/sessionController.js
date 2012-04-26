var Lin = require('../../lib/linProxy'),
    Util = require('util'),
    Logger = require('nlogger').logger(module),
    Util = require('util');


HOME_URL = "/";  // where to go after login

/**
  Store credentials in req.session
*/
function setCredentials(req, options) {
  if (!req.session.credentials) req.session.credentials = {};
  if (options) {
    if (options.token && options.secret) {
      req.session.credentials.token = {token:options.token, secret:options.secret};
    } else if (options.leo){
      req.session.credentials.leo = options.leo;
    } else if (options.requestToken && options.requestTokenSecret) {
      req.session.credentials.token = {requestToken:options.requestToken, requestTokenSecret:options.requestTokenSecret};
    }
  }
}


/**
  Helper to consistenly display error message and redirect to login screen
*/
function loginError(req, res, errorMessage) {
  req.flash('error', errorMessage);
  newSession(req, res);
}


/**
  Logout by clearing session, and show login form
*/
function newSession(req, res, next) {
  req.session.credentials = undefined;
  res.render('sessions/new');
}


/**
  Perform login based on type.  Either stay on login form with error, or redirect to '/'
*/
function login(req, res, next) {
  requestToken(req, res, next);
}


// ===== Request/Access Token flow ================================================================

/**
  Make Oauth RequestToken request.  Redirect to page where user can sign on using linkedin credentials.  Flow will
  redirect to callback url specified in Lin.init()
*/
function requestToken(req, res, next) {
  Lin.requestToken(function(err, response) {
    if (err) {
      Logger.error("Error:" + Util.inspect(err));
      return loginError(req, res, 'Ooops:  ' + Util.inspect(err));
    } else {
      setCredentials(req, {requestToken:response.requestToken, requestTokenSecret:response.requestTokenSecret});
      res.redirect(response.redirectUrl);
    }
  });
}


function accessToken(req, res, next) {
  var token = req.session.credentials.token;
  Lin.accessToken(token.requestToken, token.requestTokenSecret, req.query.oauth_verifier, function(err, response) {
    if (err) {
      Logger.error("Error:" + Util.inspect(err));
      return loginError(req, res, 'Ooops:  ' + Util.inspect(err));
    } else {
      setCredentials(req, {token:response.accessToken, secret:response.accessTokenSecret});
      res.redirect(HOME_URL);
    }
  });
}


// ===== Current User ===================================================================================


/**
  Load current user credentials (stored in req.credentials) and fail if unauthorized.
*/
function currentUser(req, res, next) {
  if (!req.session.credentials) {
    req.flash('error', "Your session has expired.  Please log in again.");
    // we want to error out on expired sessions for partials -- need to handle the redirect differently
    var statusCode = (req.routeConfig && req.routeConfig.partial) ? 401 : 302;
    res.redirect('/login', statusCode);
  } else {
    if (!req.session.user) {
      var api = Lin.api('v1', 'peopleAPI','profile',{fields:":(id,first-name,last-name)"})
      Lin.makeRequest(req, {api:api}, function(err, response) {
        if (err) {
          req.flash('error', "Unable to load user: " + err);
          var statusCode = (req.routeConfig && req.routeConfig.partial) ? 401 : 302;
          res.redirect('/login', statusCode);
        } else {
          req.session.user = JSON.parse(response.body);
          next();
        }
      });
    } else {
      next();
    }
  }
}


/**
  Continue on as guest.
*/
function guestUser(req, res, next) {
  next();
}


// ===== Routes ===================================================================================

function routes() {
  return [
    {method:'get', path:"/login", func:newSession, role:"guest"},
    {method:'get', path:"/logout", func:newSession, role:"guest"},
    {method:'post', path:"/login", func:login, role:"guest"},
    {method:'get', path:"/accessToken", func:accessToken, role:"guest"},
  ];
}
//===== PUBLIC ================================================================

module.exports = {
  routes: routes,
  currentUser: currentUser,
  guestUser: guestUser
};