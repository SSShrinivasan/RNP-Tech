const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Auth APIs", () => {

  let email;
  let tenantId;

  beforeAll(() => {
    email = `admin${Date.now()}@test.com`;
    tenantId = `tenant_${Date.now()}`;
  });

  test("Register Admin - should succeed", async () => {
    const res = await request(app)
      .post("/api/auth/register-admin")
      .send({
        name: "Admin",
        email,
        password: "123456",
        tenantId
      });

    expect(res.statusCode).toBe(200); // strict
    expect(res.body.email).toBe(email);
  });

  test("Login - should return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("Register should fail without email", async () => {
    const res = await request(app)
      .post("/api/auth/register-admin")
      .send({
        name: "Admin",
        password: "123456",
        tenantId
      });

    expect(res.statusCode).toBe(400); // negative test
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});