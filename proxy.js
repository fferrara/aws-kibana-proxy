var https = require('https');
var httpProxy = require('http-proxy');
var express = require('express');
var bodyParser = require('body-parser');
var stream = require('stream');
var figlet = require('figlet');
var basicAuth = require('basic-auth-connect');
var compress = require('compression');
var fs = require('fs');

var yargs = require('yargs')
    .usage('usage: $0 [options] <aws-es-cluster-endpoint>')
    .option('key', {
        alias: 'ssl-key',
        demand: true,
        describe: 'path of the SSL key',
        type: 'string'
    })
    .option('cert', {
        alias: 'ssl-cert',
        default: process.env.BIND_ADDRESS || '127.0.0.1',
        demand: true,
        describe: 'path of the SSL cert',
        type: 'string'
    })
    .option('b', {
        alias: 'bind-address',
        default: process.env.BIND_ADDRESS || '127.0.0.1',
        demand: false,
        describe: 'the ip address to bind to',
        type: 'string'
    })
    .option('p', {
        alias: 'port',
        default: process.env.PORT || 9200,
        demand: false,
        describe: 'the port to bind to',
        type: 'number'
    })
    .option('r', {
        alias: 'region',
        default: process.env.REGION,
        demand: false,
        describe: 'the region of the Elasticsearch cluster',
        type: 'string'
    })
    .option('u', {
      alias: 'user',
      default: process.env.USER,
      demand: false,
      describe: 'the username to access the proxy'
    })
    .option('a', {
      alias: 'password',
      default: process.env.PASSWORD,
      demand: false,
      describe: 'the password to access the proxy'
    })
    .option('s', {
      alias: 'silent',
      default: false,
      demand: false,
      describe: 'remove figlet banner'
    })
    .help()
    .version()
    .strict();
var argv = yargs.argv;

var myssl = {
    key: fs.readFileSync(argv.key),
    cert: fs.readFileSync(argv.cert)
};

var ENDPOINT = process.env.ENDPOINT || argv._[0];

if (!ENDPOINT) {
    yargs.showHelp();
    process.exit(1);
}

// Try to infer the region if it is not provided as an argument.
var REGION = argv.r;
if (!REGION) {
    var m = ENDPOINT.match(/\.([^.]+)\.es\.amazonaws\.com\.?$/);
    if (m) {
        REGION = m[1];
    } else {
        console.error('region cannot be parsed from endpoint address, either the endpoint must end ' +
                      'in .<region>.es.amazonaws.com or --region should be provided as an argument');
        yargs.showHelp();
        process.exit(1);
    }
}

var TARGET = process.env.ENDPOINT || argv._[0];
if (!TARGET.match(/^https?:\/\//)) {
    TARGET = 'https://' + TARGET;
}

var BIND_ADDRESS = argv.b;
var PORT = argv.p;


var proxy = httpProxy.createProxyServer({
	ssl: myssl,
    target: TARGET,
    changeOrigin: true,
    secure: true
});

var app = express();
app.use(compress());
app.use(basicAuth(argv.u, argv.a));
app.use(bodyParser.raw({type: function() { return true; }}));
app.use(function (req, res) {
    var bufferStream;
    if (Buffer.isBuffer(req.body)) {
        var bufferStream = new stream.PassThrough();
        bufferStream.end(req.body);
    }
    proxy.web(req, res, {buffer: bufferStream});
});

proxy.on('proxyReq', function(proxyReq, req){
   proxyReq.removeHeader('Authorization');
});


https.createServer(myssl, app).listen(9200, '0.0.0.0');

console.log('Kibana available at https://' + BIND_ADDRESS + ':' + PORT + '/_plugin/kibana/');
