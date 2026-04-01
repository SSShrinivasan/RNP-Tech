const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

let adminToken;
let tenantId;
let adminEmail;

beforeAll(async () => {
  tenantId = `tenant_${Date.now()}`;
  adminEmail = `admin${Date.now()}@test.com`;

  // 1. Register Admin
  await request(app)
    .post("/api/auth/register-admin")
    .send({
      name: "Admin",
      email: adminEmail,
      password: "123456",
      tenantId
    });

  // 2. Login Admin
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: adminEmail,
      password: "123456"
    });

  adminToken = res.body.token;
});

describe("User Creation", () => {

  test("Admin should create user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test User",
        email: `user${Date.now()}@test.com`,
        password: "123456",
        role: "User"
      });

    console.log("CREATED USER:", res.body);

    expect(res.statusCode).toBe(200);
  });

  test("Fetch users for dropdown", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    console.log("USERS:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // user exists
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});