const express = require('express')
const envConfig = require('dotenv')
const timeout = require('connect-timeout')
const port = process.env.PORT || 5000;
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer')

// add stealth plugin and use defaults (all evasion techniques)
//const puppeteer = require('puppeteer-extra')
//const StealthPlugin = require('puppeteer-extra-plugin-stealth')
//puppeteer.use(StealthPlugin())
envConfig.config();

const app = express();
app.use(timeout('300s'))
app.use(haltOnTimedout)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(haltOnTimedout)

app.use(haltOnTimedout)
app.get('/', async (req, res, next) => { 
    try {
        console.log("/ test logging")
        res.send("Functioning");
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
app.use(haltOnTimedout)

app.use(haltOnTimedout)
app.get('/apple/', async (req, res, next) => { 
    console.log("/apple/ test logging")
    var data = [];
    console.log(req.query);
    var APPLE_USER_ID = req.query.username;
    var APPLE_PW = req.query.password;
    var APPLE_USER_ID = APPLE_USER_ID.normalize('NFKC');
    var APPLE_PW = APPLE_PW.normalize('NFKC');
    let url = "https://podcastsconnect.apple.com"; 
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];

    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp'
    };

    let browser = await puppeteer.launch(options);
    try {
        let page = await browser.newPage(url + "/login");
        await page.goto(url).then(() => console.log("/login REACHED"));
        await page.waitForSelector("iframe").then(() => console.log("IFRAME LOADED"));
        const frame = page.frames().find(frame => frame.name() === 'aid-auth-widget');
        await frame.waitForSelector('#account_name_text_field').then(() => console.log('account_name_text_field is present'));
        await frame.type('#account_name_text_field', APPLE_USER_ID).then(() => console.log('account_name_text_field is entered'));
        await page.keyboard.press('Enter', {delay: 2000}).then(() => console.log('Enter'));
        await frame.waitForSelector('#password_text_field').then(() => console.log('password_text_field is present'));
        await frame.click('#password_text_field', {delay: 2000}).then(() => console.log('password_text_field is clicked'));
        for (var i=0; i<APPLE_PW.length; i++) {
            await page.keyboard.press(APPLE_PW.charAt(i));
        }
        await page.keyboard.press('Enter').then(() => console.log('Enter'));
        try {
            await page.waitForNavigation({ timeout: 5000 });
        // do what you have to do here
        } catch (e) {
            console.log(e);
        }
        await page.goto("https://podcastsconnect.apple.com/analytics/shows").then(() => console.log("/analytics/shows"));
        await page.waitForSelector("table").then(() => console.log("TABLE LOADED"));
        
        let urls = await page.evaluate(() => 
            Array.from(
                document.querySelectorAll('td.Table__TD-sc-15luk7c-5 a'), 
                e => e.href
            )
        );
        var filterurls = urls.filter(function(item, index){
            return urls.indexOf(item) >= index;
        });

        for (var i = 0; i < filterurls.length; i++) {
            await page.goto(filterurls[i] + "/episodes").then(() => console.log(filterurls[i] + " REACHED"));
            await page.setViewport({ width: 1920, height: 1080});
            await page.waitForSelector("table").then(() => console.log("TABLE LOADED"));
            if ( i == 0) {
                console.log("HEADERS ADDED " + i); 
                const podcastEpisodeHeaders = await page.evaluate(() => {
                    const tds = Array.from(document.querySelectorAll(`table thead tr th:not(.gxmHXK)`))
                    return tds.map(td => td.innerText)
                });
                data.push(podcastEpisodeHeaders); 
            }
            const podcastEpisodeData = await page.evaluate(() => {
                const rows = document.querySelectorAll('table tbody tr');
                return Array.from(rows, row => {
                    const columns = row.querySelectorAll('td');
                    return Array.from(columns, column => column.innerText);
                });
            });
            for (var j = 0; j < podcastEpisodeData.length; j++) {
                data.push(podcastEpisodeData[j]);
            }
        }
        await browser.close();
        console.log("DONE")
        res.status(200).json(data);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; 
        }
        await browser.close();
        next(err);
    }
});
app.use(haltOnTimedout)

app.use(haltOnTimedout)
app.get('/spotify/', async (req, res, next) => { 
    console.log("/apple/ test logging")
    var data = [];
    console.log(req.query);
    var SPOTIFY_USER_ID = req.query.username;
    var SPOTIFY_PW = req.query.password;
    //var SPOTIFY_USER_ID = "general@meetcute.com";
    //var SPOTIFY_PW = "TbvKzNEKjkPaAxLJZeRw9GPT";
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];

    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp' 
    };

    let browser = await puppeteer.launch(options);
    try {
        let page = await browser.newPage();
        await page.goto("https://www.spotify.com/us/logout/").then(() => console.log("LOGOUT REACHED"));
        await page.goto("https://accounts.spotify.com/en/login").then(() => console.log("/en/login REACHED"));
        await page.waitForSelector('#login-username').then(() => console.log('login-username is present'));
        await page.type('#login-username', SPOTIFY_USER_ID).then(() => console.log('login-username is entered'));
        await page.waitForSelector('#login-password').then(() => console.log('login-password is present'));
        await page.type('#login-password', SPOTIFY_PW).then(() => console.log('login-password is entered'));
        await page.keyboard.press('Enter').then(() => console.log('Enter'));
        try {
            await page.waitForNavigation({ timeout: 2000 });
        } catch (e) {
            console.log(e);
        }
        await page.goto("https://podcasters.spotify.com/catalog").then(() => console.log("/catalog"));
        try {
            await page.waitForSelector("table", { timeout: 5000 }).then(() => console.log("TABLE LOADED"));
        } catch (e) {
            console.log(e);
        }
        
        let urls = await page.evaluate(() => 
            Array.from(
                document.querySelectorAll('.eHYZLM a'), 
                e => e.href
            )
        );
        console.log(urls);
        for (var i = 0; i < urls.length; i++) {
            await page.goto(urls[i]).then(() => console.log(page.url()));
            await page.waitForSelector(`div[data-qa="date-range-selector"]`)
            await page.click(`div[data-qa="date-range-selector"] button`, {delay: 2000}).then(() => console.log('FilterWithDatePicker_button__3IbTc'));
            await page.waitForSelector(`ul[data-qa="date-options-list"]`, {delay: 2000}).then(() => console.log('Dropdown_parent__xM3F_'));
            await page.evaluate(() => {
                document.querySelectorAll(`ul[data-qa="date-options-list"] li`).forEach(elem => {
                    console.log(elem)
                    if (elem.innerText == "All time") {
                        elem.click();
                    }
                })
            });
            await page.setViewport({ width: 1920, height: 1080});
            await sleep(500);
            const pagination = await page.evaluate(() => {
                const pages = document.querySelector(`span[class="Label-sc-1utc215-0 kndIBp"]`)
                return pages.innerText
            });
            var paginationArr = pagination.split(" of ");
            var startPage = 1;
            var endPage = 1;
            if (paginationArr.length == 2) {
                startPage = parseInt(paginationArr[0])
                endPage = parseInt(paginationArr[1])
            }

            if ( i == 0) {
                const podcastEpisodeHeaders = await page.evaluate(() => {
                    const tds = Array.from(document.querySelectorAll(`table thead tr th`))
                    return tds.map(td => td.innerText)
                });
                data.push(podcastEpisodeHeaders); 
            }

            for (var j = startPage; j <= endPage; j++) {
                await page.waitForSelector("table");
                var podcastEpisodeData = await page.evaluate(() => {
                    const rows = document.querySelectorAll('table tbody tr');
                    return Array.from(rows, row => {
                        const columns = row.querySelectorAll('td');
                        return Array.from(columns, column => column.innerText);
                    });
                });

                console.log(podcastEpisodeData[0])
                for (var x = 0; x < podcastEpisodeData.length; x++) {
                    data.push(podcastEpisodeData[x]);
                }
                await page.click(`button[aria-label="Forward button"]`);
                await sleep(500);
            }
        }
        await page.goto("https://www.spotify.com/us/logout/").then(() => console.log("LOGOUT REACHED"));
        await browser.close();
        console.log("DONE")
        res.status(200).json(data);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; 
        }
        await browser.close();
        next(err);
    }
});
app.use(haltOnTimedout)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
app.listen(port);