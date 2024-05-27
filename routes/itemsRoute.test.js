const request = require("supertest");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/userModel");
const Item = require("../models/itemModel");

describe("/items", () => {
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
    name:"item1&item2",
    ingredients:["ingre1","ingre2"],
    techniques:["tech1", "tech2"],
    garnish:["gar1", "gar2"]
  };
  const item3 = { 
    name:"item2&item3",
    ingredients:["ingre1","ingre2","ingre3"],
    techniques:["tech2", "tech3"],
    garnish:["gar2", "gar3"]
  };

  describe("Before login", () => {
    describe("POST /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).post("/items").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer BAD")
          .send(item0);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("GET /", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/items").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/items")
          .set("Authorization", "Bearer BAD")
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe("GET /:id", () => {
      it("should send 401 without a token", async () => {
        const res = await request(server).get("/items/123").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it("should send 401 with a bad token", async () => {
        const res = await request(server)
          .get("/items/456")
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
        { $push: { roles: "admin" } }
      );
      const res1 = await request(server).post("/users/login").send(user1);
      adminToken = res1.body.token;

      await request(server).post("/users/signup").send(user2);
      await User.updateOne(
        { email: user2.email },
        { $push: { roles: "manager" } }
      );
      const res2 = await request(server).post("/users/login").send(user2);
      managerToken = res2.body.token;
    });

    describe.each([item0, item1])("POST / item %#", (item) => {
      it("should send 403 to normal user and not store item", async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + token0)
          .send(item);
        expect(res.statusCode).toEqual(403);
        expect(await Item.countDocuments()).toEqual(0);
      });

      it("should send 200 to admin user and store item", async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + adminToken)
          .send(item);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(item);
        const savedItem = await Item.findOne({ _id: res.body._id }).lean();
        expect(savedItem).toMatchObject(item);
      });

      it("should send 200 to manager user and store item", async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + managerToken)
          .send(item);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(item);
        const savedItem = await Item.findOne({ _id: res.body._id }).lean();
        expect(savedItem).toMatchObject(item);
      });
    });

    describe.each([item0, item1])("PUT / item %#", (item) => {
      let originalItem;
      beforeEach(async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + adminToken)
          .send(item);
        originalItem = res.body;
      });

      it("should send 403 to normal user and not update item", async () => {
        const res = await request(server)
          .put("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + token0)
          .send({ ...item });
        expect(res.statusCode).toEqual(403);
        const newItem = await Item.findById(originalItem._id).lean();
        newItem._id = newItem._id.toString();
        expect(newItem).toMatchObject(originalItem);
      });

      it("should send 200 to admin user and update item", async () => {
        const res = await request(server)
          .put("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + adminToken)
          .send({ ...item });
        expect(res.statusCode).toEqual(200);
        const newItem = await Item.findById(originalItem._id).lean();
        newItem._id = newItem._id.toString();
        expect(newItem).toMatchObject({
          ...originalItem
        });
      });
    });

    describe.each([item0, item1])("PUT / item %#", (item) => {
      let originalItem;
      beforeEach(async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + managerToken)
          .send(item);
        originalItem = res.body;
      });
      it("should send 200 to manager user and update item", async () => {
        const res = await request(server)
          .put("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + managerToken)
          .send({ ...item });
        expect(res.statusCode).toEqual(200);
        const newItem = await Item.findById(originalItem._id).lean();
        newItem._id = newItem._id.toString();
        expect(newItem).toMatchObject({
          ...originalItem
        });
      });
    });

    describe.each([item0, item1])("GET /:id item %#", (item) => {
      let originalItem;
      beforeEach(async () => {
        const res = await request(server)
          .post("/items")
          .set("Authorization", "Bearer " + adminToken)
          .send(item);
        originalItem = res.body;
      });

      it("should send 200 to normal user and return item", async () => {
        const res = await request(server)
          .get("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalItem);
      });

      it("should send 200 to admin user and return item", async () => {
        const res = await request(server)
          .get("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalItem);
      });

      it("should send 200 to manager user and return item", async () => {
        const res = await request(server)
          .get("/items/" + originalItem._id)
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalItem);
      });

    });

    describe("GET /", () => {
      let items;
      beforeEach(async () => {
        items = (await Item.insertMany([item0, item1])).map((i) => i.toJSON());
        items.forEach((i) => (i._id = i._id.toString()));
      });

      it("should send 200 to normal user and return all items", async () => {
        const res = await request(server)
          .get("/items/")
          .set("Authorization", "Bearer " + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(items);
      });

      it("should send 200 to admin user and return all items", async () => {
        const res = await request(server)
          .get("/items/")
          .set("Authorization", "Bearer " + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(items);
      });

      it("should send 200 to manager user and return all items", async () => {
        const res = await request(server)
          .get("/items/")
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(items);
      });
    });
    
    describe("GET /search", () => {
      let items;
      beforeEach(async () => {
        items = (await Item.insertMany([item0, item1, item2, item3])).map((i) => i.toJSON());
        items.forEach((i) => (i._id = i._id.toString()));
      });

      it("should return one matching item", async () => {
        const searchTerm = 'item0'
        const res = await request(server)
          .get("/items/search?query=" + encodeURI(searchTerm))
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([items[0]]);
      });

      it("should return two matching items sorted by best matching single term", async () => {
        const searchTerm = 'item1'
        const res = await request(server)
          .get("/items/search?query=" + encodeURI(searchTerm))
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          items[1],
          items[2]
        ]);
      });

      it("should return multiple matching items sorted by best multiple terms", async () => {
        const searchTerm = 'ingre1'
        const res = await request(server)
          .get("/items/search?query=" + encodeURI(searchTerm))
          .set("Authorization", "Bearer " + managerToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(3);
        expect(res.body).toContainEqual(expect.objectContaining(items.find(item => item.name === "item2&item3",)));
        expect(res.body).toContainEqual(expect.objectContaining(items.find(item => item.name === "item1&item2",)));
        expect(res.body).toContainEqual(expect.objectContaining(items.find(item => item.name === "item1",)));
      });
    });
  });
});
