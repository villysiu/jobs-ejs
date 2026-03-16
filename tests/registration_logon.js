const app = require("../app");
const { factory, seed_db } = require("../util/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../util/get_chai");
const mongoose = require("mongoose");

const User = require("../models/User");

describe("tests for registration and logon", function () {
  // after(() => {
  //   server.close();
  // });


  it("should get the registration page", async function () {
    const { expect, request } = await get_chai();
    const req = request.execute(app).get("/sessions/register").send();
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Enter your name");
    const textNoLineEnd = res.text.replaceAll("\n", "");
    const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
    expect(csrfToken).to.not.be.null;
    this.csrfToken = csrfToken[1];
    expect(res).to.have.property("headers");
    expect(res.headers).to.have.property("set-cookie");
    const cookies = res.headers["set-cookie"];
    // console.log(cookies)
//     [
//   '__Host-csrfToken=s%3A7a300d61-27a8-46b4-a1cc-74dbc3dbd25a.74s%2BG47w3d7w4kxi%2FpjdYAViYyI8QpDENTONydvYbW8; Path=/; HttpOnly; Secure; SameSite=None',
//   'connect.sid=s%3A2UW32C51pGfz1uL6VU1FiE3jKddb0iPM.GC6cZVMN%2Bk2MFq%2FyJ%2FsTIhycIM6UxBckOPF99tbeoBA; Path=/; HttpOnly; SameSite=Strict'
// ]
    this.csrfCookie = cookies.find((element) =>
      element.includes("__Host-csrfToken="),
    );
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("should register the user", async function () {
    const { expect, request } = await get_chai();
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    // console.log(dataToPost)
    const req = request
      .execute(app)
      .post("/sessions/register")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);
    const res = await req;
    
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Jobs List");
    newUser = await User.findOne({ email: this.user.email });
    expect(newUser).to.not.be.null;
  });

  it("should log the user on", async function() {
    // console.log("IN LOGON")
    // console.log(this.user)
    // console.log("this.csrfToken", this.csrfToken)
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");
    const cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.sessionCookie).to.not.be.undefined;
  });

  it("should get the index page", async  function() {
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .get("/")
      // .set("Cookie", this.csrfCookie)
      // .set("Cookie", this.sessionCookie)
       .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)
      .send();
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include(this.user.name);
  });

  it("should logoff the user", async function() {
    // console.log("IN LOGOFF")
    // console.log(this.user)
    // console.log("this.csrfToken", this.csrfToken)
    const { expect, request } = await get_chai();
    const postData = { _csrf: this.csrfToken };
    const req = request
        .execute(app)
        .post("/sessions/logoff")
        .set("Cookie", this.csrfCookie + ";" + this.sessionCookie)
        .set("content-type", "application/x-www-form-urlencoded")
        .send(postData)
      
    const res = await req;
    // console.log(res.headers)
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("link to logon");

  });

  
});