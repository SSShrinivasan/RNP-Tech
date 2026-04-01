const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

let adminToken;
let userToken;
let email;
let tenantId;

beforeAll(async () => {
  email = `admin${Date.now()}@test.com`;
  tenantId = `tenant_${Date.now()}`;

  // Register Admin
  await request(app)
    .post("/api/auth/register-admin")
    .send({
      name: "Admin",
      email,
      password: "123456",
      tenantId
    });

  // Login Admin
  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: "123456"
    });

  adminToken = adminRes.body.token;

  // Create normal user
  const userRes = await request(app)
    .post("/api/auth/register")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "User",
      email: `user${Date.now()}@test.com`,
      password: "123456",
      role: "User"
    });

  // Login user
  const loginUser = await request(app)
    .post("/api/auth/login")
    .send({
      email: userRes.body.email,
      password: "123456"
    });

  userToken = loginUser.body.token;
});

describe("Task APIs", () => {

  test("Admin can fetch tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("User cannot create task (RBAC)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Task",
        description: "Test"
      });

    expect(res.statusCode).toBe(403); // RBAC
  });

  test("Reject invalid status update", async () => {
    const fakeId = "64f000000000000000000000";

    const res = await request(app)
      .put(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "INVALID"
      });

    expect([400, 404]).toContain(res.statusCode);
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});