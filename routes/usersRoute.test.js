const request = require("supertest");
const jwt = require("jsonwebtoken");
const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/userModel");

describe("/usersRoute", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const user0 = {
    email: "user0@mail.com",
    password: "123password",
  };
  const user1 = {
    email: "user1@mail.com",
    password: "456password",
  };

  describe("before signup", () => {
    describe("Static /", () => {
      it("should return 200 home page", async () => {
        const res = await request(server).get("/")
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("Noi-Cocktail-Recipe");
      });
    });

    describe("POST /", () => {
      it("should return 401", async () => {
        const res = await request(server).post("/users/login").send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("PUT /password", () => {
      it("should return 401", async () => {
        const res = await request(server).put("/users/password").send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("POST /logout", () => {
      it("should return 404", async () => {
        const res = await request(server).post("/users/logout").send();
        expect(res.statusCode).toEqual(404);
      });
    });
  });

  describe("signup ", () => {
    describe("POST /signup", () => {
      it("should return 400 without a password", async () => {
        const res = await request(server).post("/users/signup").send({
          email: user0.email,
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 400 with empty password", async () => {
        const res = await request(server).post("/users/signup").send({
          email: user1.email,
          password: "",
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 200 and with a password", async () => {
        const res = await request(server).post("/users/signup").send(user1);
        expect(res.statusCode).toEqual(200);
      });
      it("should return 409 Conflict with a repeat signup", async () => {
        let res = await request(server).post("/users/signup").send(user0);
        expect(res.statusCode).toEqual(200);
        res = await request(server).post("/users/signup").send(user0);
        expect(res.statusCode).toEqual(409);
      });
      it("should not store raw password", async () => {
        await request(server).post("/users/signup").send(user0);
        const users = await User.find().lean();
        users.forEach((user) => {
          expect(Object.values(user).includes(user0.password)).toBe(false);
        });
      });
    });
  });

  describe.each([user0, user1])("User %#", (user) => {
    beforeEach(async () => {
      await request(server).post("/users/signup").send(user0);
      await request(server).post("/users/signup").send(user1);
    });

    describe("POST /", () => {
      it("should return 400 when password isn't provided", async () => {
        const res = await request(server).post("/users/login").send({
          email: user.email,
        });
        expect(res.statusCode).toEqual(400);
      });
      it("should return 401 when password doesn't match", async () => {
        const res = await request(server).post("/users/login").send({
          email: user.email,
          password: "123",
        });
        expect(res.statusCode).toEqual(401);
      });
      it("should return 200 and a token when password matches", async () => {
        const res = await request(server).post("/users/login").send(user);
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.token).toEqual("string");
      });
      it("should not store token on user", async () => {
        const res = await request(server).post("/users/login").send(user);
        const token = res.body.token;
        const users = await User.find().lean();
        users.forEach((user) => {
          expect(Object.values(user)).not.toContain(token);
        });
      });
      it("should return a JWT with user email, _id, and roles inside, but not password", async () => {
        const res = await request(server).post("/users/login").send(user);
        const token = res.body.token;
        const decodedToken = jwt.decode(token);
        expect(decodedToken.email).toEqual(user.email);
        expect(decodedToken.roles).toEqual(["user"]);
        expect(decodedToken._id).toMatch(
          /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
        ); // mongo _id regex
        expect(decodedToken.password).toBeUndefined();
      });
    });
  });

  describe("After both users login", () => {
    let token0;
    let adminToken;
    beforeEach(async () => {
      await request(server).post("/users/signup").send(user0);
      const res0 = await request(server).post("/users/login").send(user0);
      token0 = res0.body.token;
      const decodedToken0 = jwt.decode(token0);
      id0 = decodedToken0._id;

      await request(server).post("/users/signup").send(user1);
      await User.updateOne(
        { email: user1.email },
        { $push: { roles: "admin" } }
      );
      const res1 = await request(server).post("/users/login").send(user1);
      adminToken = res1.body.token;
      adminId = res1.body.__id;
    });

    describe("PUT /password", () => {
      it("should reject bogus token", async () => {
        const res = await request(server)
          .put("/users/password")
          .set("Authorization", "Bearer BAD")
          .send({ password: "123" });
        expect(res.statusCode).toEqual(401);
      });

      it("should reject empty password", async () => {
        const res = await request(server)
          .put("/users/password")
          .set("Authorization", "Bearer " + token0)
          .send({ password: "" });
        expect(res.statusCode).toEqual(400);
      });

      it("should change password for user0", async () => {
        const res = await request(server)
          .put("/users/password")
          .set("Authorization", "Bearer " + token0)
          .send({ password: "123" });
        expect(res.statusCode).toEqual(200);
        let loginRes0 = await request(server).post("/users/login").send(user0);
        expect(loginRes0.statusCode).toEqual(401);
        loginRes0 = await request(server).post("/users/login").send({
          email: user0.email,
          password: "123",
        });
        expect(loginRes0.statusCode).toEqual(200);
        const loginRes1 = await request(server).post("/users/login").send(user1);
        expect(loginRes1.statusCode).toEqual(200);
      });

      it("should change password for user1", async () => {
        const res = await request(server)
          .put("/users/password")
          .set("Authorization", "Bearer " + adminToken)
          .send({ password: "123" });
        expect(res.statusCode).toEqual(200);
        const loginRes0 = await request(server).post("/users/login").send(user0);
        expect(loginRes0.statusCode).toEqual(200);
        let loginRes1 = await request(server).post("/users/login").send(user1);
        expect(loginRes1.statusCode).toEqual(401);
        loginRes1 = await request(server).post("/users/login").send({
          email: user1.email,
          password: "123",
        });
        expect(loginRes1.statusCode).toEqual(200);
      });
    });

    describe("POST /:userId/roles", () => {
      it("should reject bogus token", async () => {
        const res = await request(server)
          .post("/users/"+id0+"/roles")
          .set("Authorization", "Bearer BAD")
          .send( {"roles" : "admin"});
        expect(res.statusCode).toEqual(401);
      });
      it("should reject empty password", async () => {
        const res = await request(server)
          .post("/users/"+id0+"/roles")
          .set("Authorization", "Bearer " + token0)
          .send({"roles" : "admin"} );
        expect(res.statusCode).toEqual(403);
      });
      it("should change password for user0", async () => {
        const res = await request(server)
          .post("/users/"+id0+"/roles")
          .set("Authorization", "Bearer " + adminToken)
          .send( {"roles" : "admin"});
        expect(res.statusCode).toEqual(200);
        const loginRes = await request(server).post("/users/login").send(user0);
        const token0Roles = loginRes.body.token;
        const decodedTokenTest = jwt.decode(token0Roles);
        expect(decodedTokenTest.roles).toEqual(["user","admin"]);
      });
    });
  });
});
