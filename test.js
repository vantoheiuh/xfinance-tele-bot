const puppeteer = require('puppeteer');

async function getTitleOfURL(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to load completely

        const title = await page.title();

        console.log('Title:', title);

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

const url = 'https://twitter.com/MenLucky886/status/1706553263204765745?s=20';
getTitleOfURL(url);
