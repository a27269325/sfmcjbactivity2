'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
//const JWT = require(__dirname, '../lib/jwtDecoder.js');
var util = require('util');
var http = require('https');
var request = require('request');
const { json } = require('body-parser');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
    console.log('++1');
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
    console.log('++2');
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
    
    console.log('++3');
    /*console.log(util.inspect(req, false, null));


    logData(req);

    res.send(200, 'Execute');*/
    //console.log('+++req.inArguments[0].Line_Id: '+req.inArguments[0].Line_Id);

    // example on how to decode JWT
    console.log('req.body: '+req.body);
    console.log("body: " + util.inspect(req.body));
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        console.log('+++a');
        console.log('+++process.env.jwtSecret: '+process.env.jwtSecret);

        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        console.log('+++b');

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            // decoded in arguments
            //console.log('+++decoded.inArguments.length: '+decoded.inArguments.length);
            var decodedArgs = decoded.inArguments[decoded.inArguments.length - 1];
            console.log(decodedArgs);
            console.log("decodedArgs.imglink: "+decodedArgs.imglink);

            /*var decodedArgs2 = decoded.inArguments[0].LineId;
            console.log(decodedArgs2);*/

            console.log('postboydy: ' + "{\"to\":\""+ decodedArgs.Line_Id +"\", \"message\":[{\"type\":\"text\", \"text\":\""+ decodedArgs.message +"\"}]}");

            var linedata = "{\"to\":\""+ decodedArgs.Line_Id +"\", \"messages\":[{\"type\":\"text\", \"text\":\""+ decodedArgs.message +"\"}]}";
            var json_obj = JSON.parse(linedata);

            var linedata2 = "{\"to\":\""+ decodedArgs.Line_Id +"\", \"messages\":[{\"type\":\"image\", \"originalContentUrl\":\""+ decodedArgs.imglink + "\"," + "\"previewImageUrl\":\"" + decodedArgs.imglink + "\"}" + "]}"
            var json_obj2 = JSON.parse(linedata2);

            console.log('json_obj: '+json_obj);
            console.log('json_obj.to: '+json_obj.to);

            console.log('json_obj2: '+json_obj2);
            console.log('json_obj2.to: '+json_obj2.to);

            if(decodedArgs.message != null && decodedArgs.message != ''){
                request.post({
                    headers: {"content-type" : "application/json", "Authorization" : "Bearer kIab4EYlaSb3YsFIb1Q5aoWGKZFAYNVZkn6FXlDHyKpqCiEVsxYfxgEKOxgggGfQyRQ/2u7UCJiCob6UDzcBAgsJgJ9b4gXmx4MFC4BwH5//zH4cqsVLIKdAONSYhsxRzwVHtiglcZeBiECCUQl3yQdB04t89/1O/w1cDnyilFU="},
                    url:     "https://api.line.me/v2/bot/message/push",
                    body:    "{\"to\":\""+ decodedArgs.Line_Id +"\", \"messages\":[{\"type\":\"text\", \"text\":\""+ decodedArgs.message +"\"}]}"
                }, function(error, response, body){
                    console.log('GGG');
                    console.log(body);
                });
            }

            if(decodedArgs.imglink != null && decodedArgs.imglink != ''){
                request.post({
                    headers: {"content-type" : "application/json", "Authorization" : "Bearer kIab4EYlaSb3YsFIb1Q5aoWGKZFAYNVZkn6FXlDHyKpqCiEVsxYfxgEKOxgggGfQyRQ/2u7UCJiCob6UDzcBAgsJgJ9b4gXmx4MFC4BwH5//zH4cqsVLIKdAONSYhsxRzwVHtiglcZeBiECCUQl3yQdB04t89/1O/w1cDnyilFU="},
                    url:     "https://api.line.me/v2/bot/message/push",
                    body:    "{\"to\":\""+ decodedArgs.Line_Id +"\", \"messages\":[{\"type\":\"image\", \"originalContentUrl\":\""+ decodedArgs.imglink + "\"," + "\"previewImageUrl\":\"" + decodedArgs.imglink + "\"}" + "]}"
                }, function(error, response, body){
                    console.log('GGG');
                    console.log(body);
                });
            }

            console.log("decodedArgs ", JSON.stringify(decodedArgs));
            console.log("decoded ", JSON.stringify(decoded));
            

            //logData(req);
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('++4');
    //logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    console.log('++5');
    console.log( '++5 req.body'+req.body );
    logData(req);
    res.send(200, 'Validate');
};