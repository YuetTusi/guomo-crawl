const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exist, newFolder, download } = require('./helper.js');

const baseUrl = 'http://www.gogogort.info/';
const listPageUrl = 'html/guomosipai/index.html';

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const listPage = await browser.newPage();

	await listPage.goto(path.join('http://192.151.155.238/html/guomosipai/'), {
		timeout: 0,
		waitUntil: 'domcontentloaded'
	});
	console.log('listPage load finished.');
	await listPage.waitForSelector('.ulPic');

	//当前页的所有a标签
	let links = await listPage.$$eval('.ulPic > li > a', (item) => {
		return item.map((a) => ({ title: a.title, href: a.href }));
	});

	for (let i = 0; i < 2; i++) {
		const { title, href } = links[i];
		const saveAs = path.join('E:/导出/', title);
		const picPage = await browser.newPage();
		await picPage.goto(href, { timeout: 0, waitUntil: 'domcontentloaded' });
		let hasFolder = await exist(saveAs);
		if (!hasFolder) {
			await newFolder(saveAs);
		}
        let images = await picPage.$$eval(`img[alt="${links[i].title}"]`, (images) => {
            return images.map((img) => {
                return { alt: img.alt, src: img.src };
            });
        });
    
        console.log(images.length);
    
        for (let i = 1; i < images.length; i++) {
            await download(images[i].src, saveAs);
        }
	}

	// await picPage.screenshot({ path: 'example.png' });

	// await picPage.waitForSelector(`img[alt="${links[5].title}"]`);

	// let images = await picPage.$$eval(`img[alt="${links[5].title}"]`, (images) => {
	// 	return images.map((img) => {
	// 		return { alt: img.alt, src: img.src };
	// 	});
	// });

	// console.log(images.length);

	// for (let i = 1; i < images.length; i++) {
	// 	await download(images[i].src, 'E:/导出/');
	// }

	await browser.close();
})();
