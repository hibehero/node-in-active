var http = require('http');

var fs = require('fs');

var path = require('path');
//  mime有根据文件扩展名得出MIME类型的能力
var mime = require('mime');

var cache = {};
// 请求文件不存在时发送404错误
function send404(res) {
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404: resource not found.');
	res.end();
}

// 提供文件数据服务

function sendFile(res, filePath, fileContents) {
	res.writeHead(
		200,
		{'Content-Type': mime.getType(path.basename(filePath))}
	);
	res.end(fileContents);
}
// 提供静态文件服务
function serveStatic(res, cache, absPath) {
	if (cache[absPath]) { //  检查文件是否缓存在内存中
		sendFile(res, absPath, cache[absPath]);// 从内存中返回文件
	} else {
		fs.exists(absPath, function (exists) {// 检查文件是否存在
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res);
			}
		});
	}
}

var server = http.createServer();

server.on('request', function (req, res) {
    var filePath = false;
    if (req.url === '/') {
        filePath = 'public/index.html'
    } else {
        filePath = 'public' + req.url;
    }
    var absPath = './' + filePath;
    console.log('absPath', absPath)
    serveStatic(res, cache, absPath)
})

server.listen('3000', function () {
    console.log('server run at http://localhost:3000')
})
