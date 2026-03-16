const puppeteer = require("puppeteer");
const get_chai = require("../util/get_chai");
const FactoryBot = require("factory-bot");
const factory = FactoryBot.factory;
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);
        //await sleeper(5000)
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto("http://localhost:3000");
    });
    after(async function () {
        this.timeout(5000);
        await browser.close();
    });
    describe("got to site", function () {
        it("should have completed a connection", async function () {});
    });
    describe("index page test", function () {
        this.timeout(10000);
        it("finds the index page logon link", async () => {
        this.logonLink = await page.waitForSelector(
            "a ::-p-text(Click this link to logon)",
        );
        });
        it("gets to the logon page", async () => {
            await this.logonLink.click();
            await page.waitForNavigation();
            const email = await page.waitForSelector('input[name="email"]');
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all the fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');
            this.password = await page.waitForSelector('input[name="password"]');
            this.submit = await page.waitForSelector("button ::-p-text(Logon)");
        });
        it("sends the logon", async () => {
            testUser = await seed_db();
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);
            await this.submit.click();
            await page.waitForNavigation();
            await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
            await page.waitForSelector("a ::-p-text(change the secret)");
            await page.waitForSelector('a[href="/secretWord"]');
            const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            const copyrText = await copyr.evaluate((el) => el.textContent);
            console.log("copyright text: ", copyrText);
        });
    });
    
    describe("puppeteer job operations", function (){
        this.timeout(10000);

        
        it("job list page test", async function () {
            const jobsLink = await page.waitForSelector(
                "a ::-p-text(Click this link to view/change Jobs)",
            );
       
            await jobsLink.click();
            await page.waitForNavigation();
            // const table = await page.waitForSelector("#jobs-table");

            const html = await page.content();

            const rows = html.split("<tr").length - 2; //title row
            
            console.log()
            // Verify there are 20 entries
            if (rows !== 20) {
                throw new Error(`Expected 20 job entries, but found ${rows}`);
            }
        })
        
        it("job form page", async function (){
            const addLink = await page.waitForSelector(
                "a ::-p-text(create new job)",
            );
       
            await addLink.click();
            await page.waitForNavigation();
            
            const html = await page.content();
            

            //  resolve the company and position fields and add button

            this.company = await page.waitForSelector('input[name="company"]');
            this.position = await page.waitForSelector('input[name="position"]')
            this.status = await page.waitForSelector('input[name="status"]');
            this.addButton = await page.waitForSelector("button ::-p-text(Add Job)");
        }) 
        it("add new job", async function () {
            const { expect } = await get_chai();
            const jobData = await factory.build('job');
            console.log(jobData)

            await this.company.type(jobData.company);
            await this.position.type(jobData.position);
            await this.status.type(jobData.status);
            await this.addButton.click();
            await page.waitForNavigation();


            await page.waitForSelector('text/Info: New job created.');

            const job = await Job.findOne().sort({ _id: -1 });
            console.log(job)
            expect(job.company).to.equal(jobData.company);
            expect(job.position).to.equal(jobData.position);

            
        })
    })
});