const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/configs/team2018/view', {waitUntil: 'networkidle2'});
  await page.setViewport({width:1600, height:2400, deviceScaleFactor:2})  
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
