/**
  Proxy requests to the Lin (LinkedIn Node) library
*/
var Lin = require('linkedin-node'),
    Logger = require('nlogger').logger(module),
    Util = require('util');


/**
Expecting palRequestDetails of the format:
  
  palRequestDetails = {
    - credentials // person making request
    - runtime     // msec
    - request  {
      - method
      - url
      - body
      - headers
      - resource // shortened string code used to categorize PAL resource, such as "people", "mailbox"
      }
    - response {statusCode, body}
  }
*/
function logRequest(err, palRequestDetails) {
  if (!palRequestDetails) palRequestDetails = {};
  var req = palRequestDetails.request;
  var rsp = palRequestDetails.response;
  var cred = palRequestDetails.credentials;
  
  var statusCode = rsp ? rsp.statusCode : '0';
  var resource = (req && req.resource) ? req.resource : 'none';
  var linkedInId = (cred && cred.linkedInId) ? cred.linkedInId : '0';
  
  if (req && req.url) {
    var method = req.method.toUpperCase();
    var url = req.url;
  } else {
    var method = 'UNKNOWN';
    var url = '/';
  }
  
  var line = 'LIN: '.concat(resource, ' ', linkedInId, ' "',
      method, ' ', url, '" ', statusCode, ' ', palRequestDetails.runtime, 'ms');
  
  if (req && req.body)
    line = line.concat(' body=', Util.inspect(req.body));
  if (err) {
    line = line.concat(' errcode=', err.statusCode);
    if (err.data)
      line = line.concat(' errdata=', Util.inspect(err.data));
  }
  
  Logger.info(line);
}


function makeRequest(req, options, callback) {
  Lin.makeRequest(req.session.credentials, options, function(err, response) {
    // log what happened
    logRequest(err, response);
    
    if (options && options.fullResponse) {
      return callback(err,response);
    } else {
      // only return the RESPONSE portion:  {statusCode, body}
      return callback(err, (response ? response.response : response));
    }
  });
}


// ====== PUBLIC ==============================================================
var interface = {
  init: Lin.init,
  makeRequest: makeRequest,
  api: Lin.api,
  requestToken: Lin.requestToken,
  accessToken: Lin.accessToken
};
module.exports = interface;
