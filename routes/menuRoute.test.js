const request = require("supertest");
const server = require("../server");
const testUtils = require("../test-utils");
const User = require("../models/userModel");
const Item = require("../models/itemModel");
const Menu = require("../models/menuModel");

describe("/menu", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  const item0 = {
    name:"item0",
    ingredients:["ingre0"],
    techniques:["tech0"],
    garnish:["gar0"]
    }
  const item1 = { 
    name:"item1",
    ingredients:["ingre1"],
    techniques:["tech1"],
    garnish:["gar1"]
  };
  const item2 = { 
    name:"item2",
    ingredients:["ingre2"],
    techniques:["tech2"],
    garnish:["gar2"]
  };
  let items;

  beforeEach(async () => {
    items = (await Item.insertMany([item0, item1, item2])).map((i) => i.toJSON());
  });

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/menus").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer BAD")
          .send(item0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/menus").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/menus")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/menus/123").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/menus/456")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  
  describe("after login", () => {
    const user0 = {
        email: "user0@mail.com",
        password: "123password",
      };
      const user1 = {
        email: "user1@mail.com",
        password: "456password",
      };
      const user2 = {
          email: "user2@mail.com",
          password: "789password",
        };
      let token0;
      let adminToken;
      let managerToken;

    beforeEach(async () => {
      await request(server).post("/users/signup").send(user0);
      const res0 = await request(server).post("/users/login").send(user0);
      token0 = res0.body.token;

      await request(server).post("/users/signup").send(user1);
      await User.updateOne(
        { email: user1.email },
        { $push: { roles: "admin" } },
      );
      const res1 = await request(server).post("/users/login").send(user1);
      adminToken = res1.body.token;

      await request(server).post("/users/signup").send(user2);
      await User.updateOne(
        { email: user2.email },
        { $push: { roles: "manager" } },
      );
      const res2 = await request(server).post("/users/login").send(user2);
      managerToken = res2.body.token;
    });

    describe("POST /", () => {
      it("should send 403 to normal user and not create menu", async () => {
        const res = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + token0)
          .send(items.map((i) => i._id));
        expect(res.statusCode).toEqual(403);
      });
      it("should send 200 to admin user and create menu with repeat items", async () => {
        const res = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1], items[1], items[0]].map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedMenu = await Menu.findOne().lean();
        expect(storedMenu).toMatchObject({
          list: [ items[1]._id, items[1]._id, items[0]._id],
          userId: (await User.findOne({ email: user1.email }))._id,
          number: 3,
        });
      });
      it("should send 200 to manger user and create menu with repeat items", async () => {
        const res = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + managerToken)
          .send([items[1], items[2], items[0]].map((i) => i._id));
        expect(res.statusCode).toEqual(200);
        const storedMenu = await Menu.findOne().lean();
        //console.log(storedMenu)
        expect(storedMenu).toMatchObject({
          list: [ items[1]._id, items[2]._id, items[0]._id],
          userId: (await User.findOne({ email: user2.email }))._id,
          number: 3,
        });
      });
      it("should send 400 with a bad item _id", async () => {
        const res = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1], "5f1b8d9ca0ef055e6e5a1f6b"].map((i) => i._id));
        expect(res.statusCode).toEqual(400);
        const storedMenu = await Menu.findOne().lean();
        expect(storedMenu).toBeNull();
      });
    });

    describe("GET /:id", () => {
      let menu0Id, menu1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + managerToken)
          .send([items[0], items[1], items[1]].map((i) => i._id));
        menu0Id = res0.body._id;
        const res1 = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1]].map((i) => i._id));
        menu1Id = res1.body._id;
      });
      it("should send 403 to normal user and not access menu", async () => {
        const res = await request(server)
          .get("/menus/" + menu0Id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(403);
      });
      it("should send 200 to manager user with their menu", async () => {
        const res = await request(server)
          .get("/menus/" + menu0Id)
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          list: [{name: item0.name},
             {name: item1.name},
             {name: item1.name}],
          userId:{email: (await User.findOne({ email: user2.email })).email},
          number: 3,
        });
      });
      it("should send 404 to manager user with someone else's menu", async () => {
        const res = await request(server)
          .get("/menus/" + menu1Id)
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it("should send 200 to admin user with their menu", async () => {
        const res = await request(server)
          .get("/menus/" + menu1Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          list: [{name: item1.name}],
          userId:{email: (await User.findOne({ email: user1.email })).email},
          number: 1,
        });
      });
      it("should send 200 to admin user with someone else's menu", async () => {
        const res = await request(server)
          .get("/menus/" + menu0Id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          list: [
            { name: item0.name },
            { name: item1.name },
            { name: item1.name }
          ],
          userId: { email: (await User.findOne({ email: user2.email })).email },
          number: 3
        });
      });
    });
    
    describe("GET /", () => {
      let menu0Id, menu1Id;
      beforeEach(async () => {
        const res0 = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + managerToken)
          .send(items.map((i) => i._id));
        menu0Id = res0.body._id;
        const res1 = await request(server)
          .post("/menus")
          .set("Authorization", "Bearer " + adminToken)
          .send([items[1]].map((i) => i._id));
        menu1Id = res1.body._id;
      });
      it("should send 200 to manager user with their one menu", async () => {
        const res = await request(server)
          .get("/menus")
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            list: [
              { name: item0.name },
              { name: item1.name },
              { name: item2.name }
            ],
            userId: {email:(await User.findOne({ email: user2.email })).email},
            number: 3,
          },
        ]);
      });
      it("should send 200 to admin user all menus", async () => {
        const res = await request(server)
          .get("/menus")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          {
            list: [
              { name: item0.name },
              { name: item1.name },
              { name: item2.name }
            ],
            userId: {email:(await User.findOne({ email: user2.email })).email},
            number: 3,
          },
          {
            list: [{name: item1.name}],
            userId: {email:(await User.findOne({ email: user1.email })).email},
            number: 1,
          },
        ]);
      });
    });
  });
});
