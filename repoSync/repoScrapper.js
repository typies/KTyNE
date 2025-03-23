import puppeteer from "puppeteer";
import fs, { readdirSync, rmSync } from "fs";

// BEWARE: The code in this file may be hideous bc I have no idea how to scrape websites, let alone scrape dynamic data line from popups

const URL = "https://ktane.timwi.de/";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  const showAll = await page.waitForSelector("#module-count > a");

  // Disabled while testing
  await showAll?.click();

  const nameList = await page.$$eval(
    "#main-table tr td.infos-1 .modlink .mod-name",
    (el) => el.map((x) => x.textContent)
  );

  const fullList = await page.$$eval(
    "#main-table td.infos-1 a.manual-selector",
    async (elHandles) => {
      const bList = [];
      elHandles.forEach((el) => {
        el.click();
        const linkUrls = Array.from(
          document.querySelectorAll(
            ".popup.disappear.manual-select .link.link-HTML a"
          )
        ).map((ele) => ele.href);
        bList.push({
          manualList: linkUrls,
          manualUrl: linkUrls[0],
        });
      });
      return bList;
    }
  );
  fullList.forEach((item, index) => (item.moduleName = nameList[index]));

  // Wipe list directory
  const directory = "src/defaultModLists/";
  readdirSync(directory).forEach((f) => rmSync(`${directory}/${f}`));

  fs.writeFile(
    `src/defaultModLists/fullList(${new Date().toDateString().slice(4)}).json`,
    JSON.stringify(fullList),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    }
  );

  await browser.close();
}

console.log(
  `
  -------------------------------------------------------------
  | This Process takes a minute or 2 to complete. Be patient. |
  -------------------------------------------------------------
  | Don't forget to update the import/variable in Sidebar.js  |
  -------------------------------------------------------------
  `
);
run();
