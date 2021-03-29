var fs = require('fs');
var { URL } = require('url');
var http = require('http');

function download(imgUrl, saveAs) {
	const { hostname, pathname } = new URL(imgUrl);

	console.log(`fetching ${imgUrl}`);

	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				hostname,
				path: pathname
			},
			function (resp) {
				var imgData = Buffer.alloc(0);
				resp.on('data', function (chunk) {
					imgData = Buffer.concat([imgData, chunk]);
					// console.log(`len=${imgData.length}`);
				});

				resp.once('end', function () {
					fs.writeFile(saveAs, imgData, function (err) {
						if (err) {
							reject(err);
						} else {
							resolve(void 0);
						}
					});
				});
			}
		);

		// 超时处理
		req.setTimeout(0, function () {
			req.destroy();
		});

		// 出错处理
		req.once('error', function (err) {
			if (err) {
				reject(err);
			} else {
				resolve(void 0);
			}
		});

		// 请求结束
		req.end();
	});
}

// download(target, path.join(__dirname, '04.jpg'));
module.exports = download;
