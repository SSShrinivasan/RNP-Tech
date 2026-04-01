const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

let adminTokenA, adminTokenB;
let userTokenA;
let tenantA, tenantB;
let adminEmailA, adminEmailB;

beforeAll(async () => {
  // CreatING    2 tenants (for isolation test)
  tenantA = `tenantA_${Date.now()}`;
  tenantB = `tenantB_${Date.now()}`;

  adminEmailA = `adminA${Date.now()}@test.com`;
  adminEmailB = `adminB${Date.now()}@test.com`;

  // ========================
  // TENANT A SETUP
  // ========================

  // Register Admin A
  await request(app)
    .post("/api/auth/register-admin")
    .send({
      name: "Admin A",
      email: adminEmailA,
      password: "123456",
      tenantId: tenantA
    });

  // Login Admin A
  const adminA = await request(app)
    .post("/api/auth/login")
    .send({
      email: adminEmailA,
      password: "123456"
    });

  adminTokenA = adminA.body.token;

  // Create User in Tenant A
  const userA = await request(app)
    .post("/api/auth/register")
    .set("Authorization", `Bearer ${adminTokenA}`)
    .send({
      name: "User A",
      email: `userA${Date.now()}@test.com`,
      password: "123456",
      role: "User"
    });

  // Login User A
  const loginUserA = await request(app)
    .post("/api/auth/login")
    .send({
      email: userA.body.email,
      password: "123456"
    });

  userTokenA = loginUserA.body.token;

  // ========================
  // TENANT B SETUP
  // ========================

  await request(app)
    .post("/api/auth/register-admin")
    .send({
      name: "Admin B",
      email: adminEmailB,
      password: "123456",
      tenantId: tenantB
    });

  const adminB = await request(app)
    .post("/api/auth/login")
    .send({
      email: adminEmailB,
      password: "123456"
    });

  adminTokenB = adminB.body.token;
});

describe("Full Backend Tests", () => {

//auth tests
  test("Auth: Login should return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmailA,
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  //RABC TESTS
  test("RBAC: User cannot create task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${userTokenA}`)
      .send({
        title: "Test Task",
        description: "RBAC Test"
      });

    expect(res.statusCode).toBe(403);
  });


  // USER CREATION TEST

  test("Admin can create user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminTokenA}`)
      .send({
        name: "New User",
        email: `user${Date.now()}@test.com`,
        password: "123456",
        role: "User"
      });

    expect(res.statusCode).toBe(200);
  });


  //  ISOLATION TEST 
  
  test("Isolation: Tenant A cannot access Tenant B data", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${adminTokenA}`);

    expect(res.statusCode).toBe(200);

    // Ensure no cross-tenant leakage
    res.body.forEach(task => {
      expect(task.tenantId).toBe(tenantA);
    });
  });

});

afterAll(async () => {
  await mongoose.connection.close();
});