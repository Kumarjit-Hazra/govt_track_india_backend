const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");
const fs = require("fs");

const PROJECT_ID = "govt-track-india-backend";
const RULES = fs.readFileSync("../firestore.rules", "utf8");

describe("Firestore Security Rules", () => {
    let testEnv;

    before(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                rules: RULES,
                host: "127.0.0.1",
                port: 8080, // Default Firestore emulator port
            },
        });
    });

    after(async () => {
        await testEnv.cleanup();
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
    });

    // ========================================================================
    // USERS Collection
    // ========================================================================
    describe("Users Collection", () => {
        it("should allow user to read/write their own profile", async () => {
            const alice = testEnv.authenticatedContext("alice");
            await assertSucceeds(
                alice.firestore().collection("users").doc("alice").set({ name: "Alice" })
            );
            await assertSucceeds(
                alice.firestore().collection("users").doc("alice").get()
            );
        });

        it("should deny user from writing another user's profile", async () => {
            const alice = testEnv.authenticatedContext("alice");
            await assertFails(
                alice.firestore().collection("users").doc("bob").set({ name: "Hacked" })
            );
        });
    });

    // ========================================================================
    // OPPORTUNITIES Collection
    // ========================================================================
    describe("Opportunities Collection", () => {
        it("should allow public read ONLY if verified == 'verified'", async () => {
            const db = testEnv.unauthenticatedContext().firestore();

            // Setup data (using admin SDK bypass)
            await testEnv.withSecurityRulesDisabled(async (context) => {
                await context.firestore().collection("opportunities").doc("verified_doc").set({
                    title: "Job 1",
                    verified: "verified"
                });
                await context.firestore().collection("opportunities").doc("unverified_doc").set({
                    title: "Job 2",
                    verified: "unverified"
                });
            });

            // Assertions
            await assertSucceeds(db.collection("opportunities").doc("verified_doc").get());
            await assertFails(db.collection("opportunities").doc("unverified_doc").get());
        });

        it("should allow admin to write opportunities", async () => {
            // Authenticated as admin email
            const admin = testEnv.authenticatedContext("admin_user", {
                email: "kumarjithazra@gmail.com",
                email_verified: true
            });

            await assertSucceeds(
                admin.firestore().collection("opportunities").doc("new_job").set({
                    title: "New Job",
                    verified: "unverified"
                })
            );
        });

        it("should deny regular user from writing opportunities", async () => {
            const alice = testEnv.authenticatedContext("alice", {
                email: "alice@example.com"
            });
            await assertFails(
                alice.firestore().collection("opportunities").doc("hacked_job").set({
                    title: "Fake Job"
                })
            );
        });
    });

    // ========================================================================
    // SOURCES Collection
    // ========================================================================
    describe("Sources Collection", () => {
        it("should deny regular user read/write", async () => {
            const alice = testEnv.authenticatedContext("alice");
            await assertFails(alice.firestore().collection("sources").doc("s1").get());
            await assertFails(alice.firestore().collection("sources").doc("s1").set({ foo: "bar" }));
        });

        it("should allow admin read/write", async () => {
            const admin = testEnv.authenticatedContext("admin", {
                email: "kumarjithazra@gmail.com"
            });
            await assertSucceeds(
                admin.firestore().collection("sources").doc("s1").set({ url: "http://example.com" })
            );
        });
    });

    // ========================================================================
    // TRACKING Collection
    // ========================================================================
    describe("Tracking Collection", () => {
        // Rules:
        // allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
        // allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
        // allow update: if isAuthenticated() && resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid;
        // allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;

        it("should allow user to create tracking doc with their own userId", async () => {
            const alice = testEnv.authenticatedContext("alice");
            await assertSucceeds(
                alice.firestore().collection("tracking").doc("track1").set({
                    userId: "alice",
                    item: "something"
                })
            );
        });

        it("should deny user creating tracking doc for others", async () => {
            const alice = testEnv.authenticatedContext("alice");
            await assertFails(
                alice.firestore().collection("tracking").doc("track2").set({
                    userId: "bob",
                    item: "something"
                })
            );
        });

        it("should allow user to read their own tracking doc", async () => {
            const alice = testEnv.authenticatedContext("alice");

            // Setup
            await testEnv.withSecurityRulesDisabled(async (ctx) => {
                await ctx.firestore().collection("tracking").doc("track1").set({ userId: "alice" });
            });

            await assertSucceeds(alice.firestore().collection("tracking").doc("track1").get());
        });

        it("should deny user reading others' tracking doc", async () => {
            const alice = testEnv.authenticatedContext("alice");

            // Setup
            await testEnv.withSecurityRulesDisabled(async (ctx) => {
                await ctx.firestore().collection("tracking").doc("trackBob").set({ userId: "bob" });
            });

            await assertFails(alice.firestore().collection("tracking").doc("trackBob").get());
        });
    });
});
