# Multi-Tenant Task Management System

This backend application demonstrates multi-tenancy, role-based access control (RBAC), and task management using Node.js, Express, and MongoDB.

---

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
```

3. Run server

```bash
node server.js
```

---

## Base URL

```
http://localhost:5000/api
```

---

# Step-by-Step Testing (with Sample Data)

Follow this sequence in Postman.

---

## 1. Create Tenant A Admin

POST `/auth/register-admin`

```
{
  "name": "Admin A",
  "email": "adminA@gmail.com",
  "password": "123456",
  "tenantId": "tenantA"
}
```

---

## 2. Login Admin A

POST `/auth/login`

```
{
  "email": "adminA@gmail.com",
  "password": "123456"
}
```

Save token as:

```
ADMIN_A_TOKEN
```

---

## 3. Create User A1

POST `/auth/register`

Header:

```
Authorization: Bearer ADMIN_A_TOKEN
```

```
{
  "name": "User A1",
  "email": "userA1@gmail.com",
  "password": "123456",
  "role": "User"
}
```

---

## 4. Login User A1

```
{
  "email": "userA1@gmail.com",
  "password": "123456"
}
```

Save:

```
USER_A1_TOKEN
```

---

## 5. Admin A creates Task

POST `/tasks`

Header:

```
Authorization: Bearer ADMIN_A_TOKEN
```

```
{
  "title": "Task A1",
  "description": "Tenant A task",
  "assignedTo": "USER_A1_ID"
}
```

---

# RBAC TESTS

---

## Test 1: User tries to create task (Should FAIL)

POST `/tasks`

Header:

```
Authorization: Bearer USER_A1_TOKEN
```

```
{
  "title": "Hack Task"
}
```

Expected:

```
403 Access denied
```

---

## Test 2: User tries to update another user’s task (Should FAIL)

PUT `/tasks/:id`

Header:

```
Authorization: Bearer USER_A1_TOKEN
```

Expected:

```
403 Not allowed
```

---

## Test 3: User updates only status (Should PASS)

```
{
  "status": "Completed"
}
```

---

## Test 4: User tries to change title (Should FAIL logically)

```
{
  "title": "Hacked"
}
```

Expected:

* Title should NOT change

---

# MULTI-TENANCY TEST

---

## 6. Create Tenant B Admin

```
{
  "name": "Admin B",
  "email": "adminB@gmail.com",
  "password": "123456",
  "tenantId": "tenantB"
}
```

---

## 7. Login Admin B

Save:

```
ADMIN_B_TOKEN
```

---

## 8. Create User B1

```
{
  "name": "User B1",
  "email": "userB1@gmail.com",
  "password": "123456",
  "role": "User"
}
```

---

## 9. Admin B creates Task

```
{
  "title": "Task B1",
  "description": "Tenant B task",
  "assignedTo": "USER_B1_ID"
}
```

---

# ISOLATION TEST (IMPORTANT)

---

## Test 5: Admin A fetch tasks

GET `/tasks`

Expected:

* Only Task A1
* Must NOT see Task B1

---

## Test 6: Admin B fetch tasks

Expected:

* Only Task B1

---

## Test 7: Cross-tenant update (Should FAIL)

Admin A tries to update Task B:

Expected:

```
404 Task not found
```

---

## Test 8: Cross-tenant assignment (Should FAIL)

Admin A tries to assign task to User B:

Expected:

```
Invalid user for this tenant
```

---

# DELETE TEST

---

## Admin deletes task (PASS)

DELETE `/tasks/:id`

Expected:

```
Task deleted successfully
```

---

## User tries to delete (FAIL)

Expected:

```
403 Access denied
```

---

# Core Logic

### Multi-Tenancy

All queries are filtered using:

```
tenantId: req.user.tenantId
```

---

### RBAC

* Admin: full control within tenant
* User: limited to assigned tasks

---

# Conclusion

This system ensures:

* Strict tenant data isolation
* Proper role-based permissions
* Secure backend validation

No cross-tenant access is possible.
# Multi-Tenant Task Management System

This backend application demonstrates multi-tenancy, role-based access control (RBAC), and task management using Node.js, Express, and MongoDB.

---

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
```

3. Run server

```bash
node server.js
```

---

## Base URL

```
http://localhost:5000/api
```

---

# Step-by-Step Testing (with Sample Data)

Follow this sequence in Postman.

---

## 1. Create Tenant A Admin

POST `/auth/register-admin`

```
{
  "name": "Admin A",
  "email": "adminA@gmail.com",
  "password": "123456",
  "tenantId": "tenantA"
}
```

---

## 2. Login Admin A

POST `/auth/login`

```
{
  "email": "adminA@gmail.com",
  "password": "123456"
}
```

Save token as:

```
ADMIN_A_TOKEN
```

---

## 3. Create User A1

POST `/auth/register`

Header:

```
Authorization: Bearer ADMIN_A_TOKEN
```

```
{
  "name": "User A1",
  "email": "userA1@gmail.com",
  "password": "123456",
  "role": "User"
}
```

---

## 4. Login User A1

```
{
  "email": "userA1@gmail.com",
  "password": "123456"
}
```

Save:

```
USER_A1_TOKEN
```

---

## 5. Admin A creates Task

POST `/tasks`

Header:

```
Authorization: Bearer ADMIN_A_TOKEN
```

```
{
  "title": "Task A1",
  "description": "Tenant A task",
  "assignedTo": "USER_A1_ID"
}
```

---

# RBAC TESTS

---

## Test 1: User tries to create task (Should FAIL)

POST `/tasks`

Header:

```
Authorization: Bearer USER_A1_TOKEN
```

```
{
  "title": "Hack Task"
}
```

Expected:

```
403 Access denied
```

---

## Test 2: User tries to update another user’s task (Should FAIL)

PUT `/tasks/:id`

Header:

```
Authorization: Bearer USER_A1_TOKEN
```

Expected:

```
403 Not allowed
```

---

## Test 3: User updates only status (Should PASS)

```
{
  "status": "Completed"
}
```

---

## Test 4: User tries to change title (Should FAIL logically)

```
{
  "title": "Hacked"
}
```

Expected:

* Title should NOT change

---

# MULTI-TENANCY TEST

---

## 6. Create Tenant B Admin

```
{
  "name": "Admin B",
  "email": "adminB@gmail.com",
  "password": "123456",
  "tenantId": "tenantB"
}
```

---

## 7. Login Admin B

Save:

```
ADMIN_B_TOKEN
```

---

## 8. Create User B1

```
{
  "name": "User B1",
  "email": "userB1@gmail.com",
  "password": "123456",
  "role": "User"
}
```

---

## 9. Admin B creates Task

```
{
  "title": "Task B1",
  "description": "Tenant B task",
  "assignedTo": "USER_B1_ID"
}
```

---

# ISOLATION TEST (IMPORTANT)

---

## Test 5: Admin A fetch tasks

GET `/tasks`

Expected:

* Only Task A1
* Must NOT see Task B1

---

## Test 6: Admin B fetch tasks

Expected:

* Only Task B1

---

## Test 7: Cross-tenant update (Should FAIL)

Admin A tries to update Task B:

Expected:

```
404 Task not found
```

---

## Test 8: Cross-tenant assignment (Should FAIL)

Admin A tries to assign task to User B:

Expected:

```
Invalid user for this tenant
```

---

# DELETE TEST

---

## Admin deletes task (PASS)

DELETE `/tasks/:id`

Expected:

```
Task deleted successfully
```

---

## User tries to delete (FAIL)

Expected:

```
403 Access denied
```

---

# Core Logic

### Multi-Tenancy

All queries are filtered using:

```
tenantId: req.user.tenantId
```

---

### RBAC

* Admin: full control within tenant
* User: limited to assigned tasks

---
---

##  Demo Login Credentials

You can use the following accounts to test the application:

###  Admin Accounts

**Admin A (Tenant A)**
- Email: admina@gmail.com
- Password: 123456

**Admin B (Tenant B)**
- Email: adminb@gmail.com
- Password: 123456

---

###  Notes

- Each admin belongs to a different tenant.
- They can only see and manage data within their own tenant.
- This demonstrates **multi-tenancy isolation + RBAC**.
# Conclusion

This system ensures:

* Strict tenant data isolation
* Proper role-based permissions
* Secure backend validation

No cross-tenant access is possible.
