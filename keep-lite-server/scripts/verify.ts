import type { Server } from "http";
import app from "../src/app";
import { prisma } from "../src/app/lib/prisma";

interface TestStats {
  passed: number;
  failed: number;
}

const stats: TestStats = { passed: 0, failed: 0 };

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    stats.passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    stats.failed++;
  }
}

async function runTests() {
  console.log("=== Starting KeepLite Integration & Verification Suite ===\n");

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 5000;
  const baseUrl = `http://localhost:${port}`;

  try {
    const timestamp = Date.now();
    const userAEmail = `user_a_${timestamp}@example.com`;
    const userBEmail = `user_b_${timestamp}@example.com`;
    const password = "Password123!";

    // --- 1. Liveness & Health Checks ---
    console.log("[1] Liveness & Health Checks");
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json() as any;
    assert(rootRes.status === 200, "GET / responds with 200");
    assert(rootData.message === "Server is running", "GET / returns liveness message");

    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    const healthData = await healthRes.json() as any;
    assert(healthRes.status === 200, "GET /api/v1/health responds with 200");
    assert(healthData.success === true && healthData.data.status === "UP", "Health envelope contains status UP");

    // --- 2. Auth Flow & Duplicate Detection ---
    console.log("\n[2] Authentication & Duplicate Detection");
    const regResA = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User A", email: userAEmail, password }),
    });
    const regDataA = await regResA.json() as any;
    assert(regResA.status === 201, "User A registered with 201");
    assert(!!regDataA.data.accessToken, "Registration returns accessToken");

    const dupRegRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User A Dup", email: userAEmail, password }),
    });
    assert(dupRegRes.status === 409, "Duplicate email registration rejected with 409");

    const regResB = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User B", email: userBEmail, password }),
    });
    const regDataB = await regResB.json() as any;
    assert(regResB.status === 201, "User B registered with 201");

    const tokenA = regDataA.data.accessToken as string;
    const tokenB = regDataB.data.accessToken as string;

    const meResA = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const meDataA = await meResA.json() as any;
    assert(meResA.status === 200, "GET /api/v1/auth/me responds with 200 for User A");
    assert(meDataA.data.email === userAEmail, "User A profile matches registered email");

    const noAuthRes = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert(noAuthRes.status === 401, "Request without token rejected with 401");

    // --- 3. Categories & Cross-User Isolation ---
    console.log("\n[3] Category Management & Cross-User Isolation");
    const catResA = await fetch(`${baseUrl}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ name: "Work Projects" }),
    });
    const catDataA = await catResA.json() as any;
    assert(catResA.status === 201, "User A creates category 'Work Projects' (201)");
    const catIdA = catDataA.data.id as number;

    const dupCatResA = await fetch(`${baseUrl}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ name: "Work Projects" }),
    });
    assert(dupCatResA.status === 409, "User A cannot create duplicate category 'Work Projects' (409 Conflict)");

    const catResB = await fetch(`${baseUrl}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ name: "Work Projects" }),
    });
    assert(catResB.status === 201, "User B CAN create category 'Work Projects' (same name allowed for different user)");

    const delCatCross = await fetch(`${baseUrl}/api/v1/categories/${catIdA}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(delCatCross.status === 404, "User B cannot delete User A's category (404 isolation)");

    // --- 4. Notes CRUD, Search, Ordering & Isolation ---
    console.log("\n[4] Notes CRUD, Search, Filter, Ordering & Isolation");
    const crossCatNoteRes = await fetch(`${baseUrl}/api/v1/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        title: "Malicious Note",
        content: "Trying to hijack User A's category",
        categoryId: catIdA,
      }),
    });
    assert(crossCatNoteRes.status === 404, "User B cannot attach note to User A's category (404)");

    const note1Res = await fetch(`${baseUrl}/api/v1/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Database Indexing",
        content: "B-Trees and Hash indexes in PostgreSQL",
        color: "#fef08a",
        isPinned: false,
        categoryId: catIdA,
      }),
    });
    const note1Data = await note1Res.json() as any;
    assert(note1Res.status === 201, "User A creates note with category (201)");
    const note1Id = note1Data.data.id as number;

    const note2Res = await fetch(`${baseUrl}/api/v1/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Grocery Shopping",
        content: "Milk, eggs, and bread",
        isPinned: false,
      }),
    });
    assert(note2Res.status === 201, "User A creates unpinned note (201)");

    const note3Res = await fetch(`${baseUrl}/api/v1/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: "Critical Security Audit",
        content: "Check auth headers and JWT tokens",
        isPinned: true,
      }),
    });
    assert(note3Res.status === 201, "User A creates pinned note (201)");

    const listNotesRes = await fetch(`${baseUrl}/api/v1/notes`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listNotesData = await listNotesRes.json() as any;
    assert(listNotesRes.status === 200, "User A lists notes (200)");
    assert(listNotesData.data.length >= 3, "User A retrieved all created notes");
    assert(listNotesData.data[0].isPinned === true, "Pinned notes sort first in the list");

    const searchRes = await fetch(`${baseUrl}/api/v1/notes?search=security`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const searchData = await searchRes.json() as any;
    assert(searchRes.status === 200, "Search query succeeds (200)");
    assert(
      searchData.data.some((n: any) => n.title.includes("Security")),
      "Search matches note title case-insensitively",
    );

    const filterRes = await fetch(`${baseUrl}/api/v1/notes?categoryId=${catIdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const filterData = await filterRes.json() as any;
    assert(filterRes.status === 200, "Category filter query succeeds (200)");
    assert(
      filterData.data.every((n: any) => n.categoryId === catIdA),
      "All returned notes belong to the requested categoryId",
    );

    const crossReadRes = await fetch(`${baseUrl}/api/v1/notes/${note1Id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(crossReadRes.status === 404, "User B cannot read User A's note (404)");

    const crossUpdateRes = await fetch(`${baseUrl}/api/v1/notes/${note1Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ title: "Hacked Title" }),
    });
    assert(crossUpdateRes.status === 404, "User B cannot update User A's note (404)");

    const crossDelRes = await fetch(`${baseUrl}/api/v1/notes/${note1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(crossDelRes.status === 404, "User B cannot delete User A's note (404)");

    // --- 5. Relational Cascade (SetNull) on Category Deletion ---
    console.log("\n[5] Relational Integrity (Category Delete -> SetNull)");
    const delCatRes = await fetch(`${baseUrl}/api/v1/categories/${catIdA}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delCatRes.status === 200, "User A deletes category (200)");

    const noteAfterCatDelRes = await fetch(`${baseUrl}/api/v1/notes/${note1Id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const noteAfterCatDelData = await noteAfterCatDelRes.json() as any;
    assert(noteAfterCatDelRes.status === 200, "Note still exists after category deletion (200)");
    assert(noteAfterCatDelData.data.categoryId === null, "Note's categoryId became null via SetNull");

    // Clean up note 1
    const delNoteRes = await fetch(`${baseUrl}/api/v1/notes/${note1Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delNoteRes.status === 200, "User A deletes note (200)");

    // --- 6. 404 Route Envelope ---
    console.log("\n[6] Unknown Route Error Envelope");
    const notFoundRes = await fetch(`${baseUrl}/api/v1/nonexistent-endpoint`);
    const notFoundData = await notFoundRes.json() as any;
    assert(notFoundRes.status === 404, "Unknown route returns 404");
    assert(notFoundData.success === false && notFoundData.statusCode === 404, "Unknown route returns standard error envelope");

    console.log(`\n=== Verification Summary: ${stats.passed} Passed, ${stats.failed} Failed ===`);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(stats.failed > 0 ? 1 : 0);
  }
}

runTests().catch((err) => {
  console.error("Verification suite failed unexpectedly:", err);
  process.exit(1);
});
