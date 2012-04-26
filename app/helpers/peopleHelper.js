var Lin = require('../../lib/linProxy'),
    Logger = require('nlogger').logger(module),
    Person = require('../formatters/person'),
    Step = require('step');
    
    
function profileFields(req, linkedInId) {
  var myProfile = (!linkedInId  || (linkedInId === req.session.credentials.linkedInId));
  // TODO incommon count=10
  // TODO connections count = 0 (just want total)
  var standardPersonFields = "id,first-name,last-name,formatted-name,headline,picture-url"
  var inCommonFields =  myProfile ? "" : "relation-to-viewer:(distance,num-related-connections,related-connections:(" + standardPersonFields +")),";  
  var fields = ":(" + inCommonFields + standardPersonFields + ",picture-urls::(original),phone-numbers,current-status,location,email-address,twitter-accounts:(provider-account-id,provider-account-name,is-primary),industry,num-connections,connections-visible,num-connections-capped,summary,positions,educations,specialties,skills,languages,recommendations-received:(id,recommendation-type,recommendation-text,recommender:(" + standardPersonFields +")),member-url-resources,main-address,im-accounts,date-of-birth,primary-twitter-account,patents,publications,certifications,group-memberships;count=0)";
  return fields;
}

/**
  Search for people
  - options
  -- keywords: string of keywords
  -- fields
  -- start
  -- count
  - callback(err, data)
*/
function search(req, options, callback) {
  // backend only supports searches with 25 results;  make calls in parallel to get desired count.
  var start = (options && options.start) ? options.start: 0;
  var count = (options && options.count) ? options.count: 100;
  var pageSize = 25;
  var times =  parseInt(count/pageSize);
  if ((count % pageSize) > 0) times += 1;
  var api = Lin.api('v1','peopleAPI','search', options);
  
  Step(
    function() {
      var group = this.group();
      // make all these calls in parallel
      for(i = 0; i < times; i++) {
        options.start = start + (i*pageSize);
        options.count = options.start + 25;
        api = Lin.api('v1','peopleAPI','search', options);
        Lin.makeRequest(req, {api:api}, group());
      }
    }, 
    // wait for all api calls to finish, find results in data[]
    function(err, data) {
      if (err) return callback(err);
      
      var result = {keywords:((options && options.keywords) ? options.keywords : ""), values:[]};
      // for each search result block, for each person found, reformat and add to result.values
      for(i = 0; i < data.length; i++) {
        var searchData = JSON.parse(data[i].body);
        if (searchData.people && searchData.people.values) {
          searchData.people.values.forEach(function(person) { 
            person = Person.reformat(person);
            if (person) result.values.push(person);
          });
        }
      }
      if (result.values.length > count) {
        result.values = result.values.slice(0,count);
      }
      result.start = start;
      result.count = result.values.length;
      return callback(undefined, result);
    }
  );
}


/**
  Retrieve person's profile
  - options
  -- id: linkedInId (if missing, retrieve profile for logged in person)
  -- authToken: retrieved with search results, gives you permissin to view this profile
  -- fields
  - callback(err, data)
*/
function profile(req, options, callback) {
  // build api request from options
  var api = Lin.api('v1','peopleAPI','profile', options);
  // make the request
  Lin.makeRequest(req, {api:api}, function(err, data) {
    if (err) return callback(err);
    
    var personData = JSON.parse(data.body);
    return callback(undefined, Person.reformat(personData));
  });
}


//===== PUBLIC ================================================================

module.exports = {
  search: search,
  profile: profile,
  profileFields: profileFields
};