const path = require('path');
const puppeteer = require('puppeteer');
const log = require('./log.js');
const { exist, newFolder, download } = require('./helper.js');

const baseUrl = 'http://192.151.155.238/html/guomosipai/';

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const listPage = await browser.newPage();

	await listPage.goto(baseUrl, {
		timeout: 0,
		waitUntil: 'domcontentloaded'
	});
	console.log('listPage load finished.');
	await listPage.waitForSelector('.ulPic');

	//当前页的所有a标签
	let links = await listPage.$$eval('.ulPic > li > a', (item) => {
		return item.map((a) => ({ title: a.title, href: a.href }));
	});

	for (let i = 1; i < links.length; i++) {
		const { title, href } = links[i];
		const saveAs = path.join('E:/导出/', title);
		const picPage = await browser.newPage();
		console.log(href);
		await picPage.goto(href, { timeout: 0, waitUntil: 'domcontentloaded' });
		let hasFolder = await exist(saveAs);
		if (!hasFolder) {
			console.log(`=========${title}=========`);
			log.info(`开始爬取:${title}`);
			await newFolder(saveAs);
		}

		//爬取图片最大分页数
		let lastPage = await picPage.$$eval('a.a1', (j, index) => {
			if (j[1].previousElementSibling) {
				//取第2个.a1之前的超链，即最后一页
				return Number(j[1].previousElementSibling.innerText);
			} else {
				return 1;
			}
		});

		let img = await picPage.$$eval(`img[alt="${links[i].title}"]`, (images) => {
			return {
				alt: images[1].alt,
				src: images[1].src
			};
		});

		log.info(`共${lastPage * 2}张图`);
		for (let i = 1; i <= lastPage * 2; i++) {
			//循环为最后一页*2，因为每页显示2张图
			let n = i.toString().padStart(2, '0') + '.jpg';
			let downImg = path.dirname(img.src) + '/' + n; //拼接图片的完成路径
			try {
				await download(downImg, saveAs);
				log.info(`爬取:${downImg}`);
			} catch (error) {
				log.error(`爬取失败: ${error.message}`);
				console.error(error.message);
			}
		}
	}

	await browser.close();
})();
