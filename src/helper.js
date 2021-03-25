const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// const baidu = 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png';

/**
 * 验证资源是否存在
 * @param {string} filePath
 * @returns Promise<boolean>
 */
function exist(filePath) {
	return new Promise((resolve, reject) => {
		fs.access(filePath, (err) => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

/**
 * 创建目录
 * @param {string}} dir
 */
function newFolder(dir) {
	return new Promise((resolve, reject) => {
		fs.mkdir(dir, { recursive: true }, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(void 0);
			}
		});
	});
}

/**
 * 写入图片到磁盘
 * @param {Buffer} chunk
 * @param {string} saveAs
 */
function saveImage(chunk, saveAs) {
	return new Promise((resolve, reject) => {
		const ws = fs.createWriteStream(saveAs);
		ws.once('error', (err) => reject(err));
		ws.once('finish', () => resolve(void 0));
		ws.write(chunk, (err) => {
			ws.close();
		});
	});
}

/**
 * 下载图片
 * @param {string}} imageSrc 源地址
 * @param {string} saveAs 另存为
 */
async function download(imageSrc, saveAs) {
	let fileName = path.basename(imageSrc);

	const browser = await puppeteer.launch({ headless: true });
	const next = await browser.newPage();

	const res = await next.goto(imageSrc, { timeout: 0, waitUntil: 'domcontentloaded' });

	const chunk = await res.buffer();

	console.log(imageSrc);

	await saveImage(chunk, path.join(saveAs, fileName));

	await browser.close();
}

module.exports = {
	exist,
	newFolder,
	download
};
