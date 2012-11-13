var sys = require ('util'),
    url = require('url'),
    http = require('http'),
    qs = require('querystring');

http.createServer(function (req, res) {
    if(req.method=='POST') {
            var body='';
            req.on('data', function (data) {
                body +=data;
            });
            req.on('end',function(){
                
                var POST =  qs.parse(body);
                console.log(POST);
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write("POST: "+JSON.stringify(POST));
		res.end();
            });
    } else if(req.method=='GET') {
        var url_parts = url.parse(req.url,true);
        console.log(url_parts.query);
	res.writeHead(200, {"Content-Type": "text/html"});
	res.write("GET: "+JSON.stringify(url_parts.query));
	res.end();
    }
}).listen(8914, "localhost");
