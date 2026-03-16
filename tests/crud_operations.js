const app = require("../app");
const get_chai = require("../util/get_chai");
const FactoryBot = require("factory-bot");
const factory = FactoryBot.factory;
// const factoryAdapter = new FactoryBot.MongooseAdapter();
const Job = require("../models/Job")
const { seed_db, testUserPassword } = require("../util/seed_db");

describe("tests for Job CRUD Operations", function () {
    before(async function () {
        const { expect, request } = await get_chai();
        this.test_user = await seed_db();
        let req = request
                    .execute(app)
                    .get("/sessions/logon")
                    .send();
        let res = await req;
        const textNoLineEnd = res.text.replaceAll("\n", "");
        this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
        let cookies = res.headers["set-cookie"];

        this.csrfCookie = cookies.find((element) =>
            element.startsWith("__Host-csrfToken="),
        );
        const dataToPost = {
            email: this.test_user.email,
            password: testUserPassword,
            _csrf: this.csrfToken,
        };


        req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0)
            .send(dataToPost);
        res = await req;

        cookies = res.headers["set-cookie"];
        console.log("All cookies after logon:", cookies);
        this.sessionCookie = cookies.find(element => element.startsWith('connect.sid=')).split(";")[0];



// console.log('Session cookie:', this.sessionCookie, "csrfCookie:", this.csrfCookie);
        expect(this.csrfToken).to.not.be.undefined;
        expect(this.sessionCookie).to.not.be.undefined;
        expect(this.csrfCookie).to.not.be.undefined;
    });

    it("should get all jobs", async function() {
        console.log("IN CRUD get 20 jobs")
        // console.log(this.user)

        const { expect, request } = await get_chai();
        console.log('Session cookie:', this.sessionCookie);


        const req = request
            .execute(app)
            .get("/jobs")
             .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)

            .send();
        const res = await req;
    
        expect(res).to.have.status(200);
     
        const pageParts = res.text.split("<tr>");
        expect(pageParts.length).to.equal(21); // 20 jobs + 1 header row
    });

    it("should add new job", async function() {
        console.log("IN CRUD add new job")
        // console.log(this.user)

        const { expect, request } = await get_chai();
        console.log('Session cookie:', this.sessionCookie);

        const jobData = await factory.build('job');
        console.log(jobData)
        const req = request
            .execute(app)
            .post("/jobs")
            .set("content-type", "application/x-www-form-urlencoded")
             .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)

            .send({
                company: jobData.company,
                position: jobData.position,
                status: jobData.status,
                _csrf: this.csrfToken
            });
        const res = await req;
     
        const jobs = await Job.find({createdBy: this.test_user._id})
        expect(jobs.length).to.equal(21)
    });
})
