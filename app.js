/**
  LinDemo:  applicatin demonstrating LinkedIn-Node-Internal library
*/
// ===== Dependencies =============================================================================

var Express = require('express'),
    Lin = require('./lib/linProxy'),
    Env = require('./lib/environments'),
    Logger = require('nlogger').logger(module),
    Routes = require('./app/routes');

// ===== Initialization ===========================================================================

// init global environment variables
Env.loadEnvironmentsSync(__dirname + '/config/environments.json');

/**
  Initialize LinkedInNodeInternal library;  set correct requestTokenCallbackUrl
*/
function initLinkedInNode() {
  try {
    Lin.init(Env.current.lini);
  } catch (e) {
    Logger.error("LinkedInNode config exception: " + e + ' ' + e.stack);
  }
}


// ===== Application Configuration ================================================================

var app = module.exports = Express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.use(Express.bodyParser());
  app.use(Express.methodOverride());
  app.use(Express.static(__dirname + '/public'));
  //Note:  this is not the most efficient session manager, but it is easiest/quickest to demo
  app.use(Express.cookieParser());
  app.use(Express.session({ secret: "superdoopersecretthatonlyiknow" }));  
  // this must be after session setup
  app.use(app.router);
  initLinkedInNode();
});

app.dynamicHelpers( {
  session: function(req, res) {
    return req.session;
  },
  flash: function(req, res) {
    return req.flash();
  }
});

/**
  Specific config for NODE_ENV=development
*/
app.configure('development', function(){
  app.use(Express.errorHandler({ dumpExceptions: true, showStack: true }));
});


/**
  Specific config for NODE_ENV=production
*/
app.configure('production', function(){
  app.use(Express.errorHandler());
});

// ===== Routes ===================================================================================


var RouteSummary = Routes.buildControllerRoutes(app);

app.get('/', function(req, res){
  res.redirect('/people');
});


// ===== Start the Server =========================================================================

// ===== Command Line =============================================================================
var port = 3000;

var usage = ''
    + 'Usage: app.js [options]'
    + '\n'
    + '\nOptions:'
    + '\n  -p, --port NUM       Port number for server, default is ' + port.toString()
    + '\n  -r, --routes         Display routes'
    + '\n  -h, --help           Display help information'
    + '\n';
    
// Parse arguments
var args = process.argv.slice(2);

while (args.length) {
  var arg = args.shift();
  switch (arg) {
    case '-h':
    case '--help':
        console.error(usage + '\n');
        process.exit(1);
        break;
    case '-p':
    case '--port':
        if (arg = args.shift()) {
            port = parseInt(arg, 10);
        } else {
            throw new Error('--port requires a number');
        }
        break;
    case '-r':
    case '--routes':
      Logger.info("ROUTES:\n" + RouteSummary.join("\n") + "\n");
      break;
    default:
        break;
  }
}

app.listen(port, undefined, function() {
  Logger.info(app.settings.env + " mode");
  Logger.info("lini-demo server listening on port " + app.address().port);
});

