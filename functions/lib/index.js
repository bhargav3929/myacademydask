"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUserRole = exports.createStadiumAndCoach = exports.grantOwnerRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();
// Allows a Super Admin to grant Owner role to a target user
exports.grantOwnerRole = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    var _a, _b;
    const callerUid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const callerRole = (_b = request.auth) === null || _b === void 0 ? void 0 : _b.token.role;
    if (!callerUid || callerRole !== "super-admin") {
        return {
            error: "Forbidden",
            message: "Only super-admins can grant owner roles.",
        };
    }
    const { targetUid, organizationId } = request.data;
    if (!targetUid || !organizationId) {
        return {
            error: "Bad Request",
            message: "Missing required fields: targetUid and organizationId",
        };
    }
    try {
        await admin.auth().setCustomUserClaims(targetUid, {
            role: "owner",
            organizationId: organizationId,
        });
        return {
            success: true,
            message: `Owner role granted to user ${targetUid}.`,
        };
    }
    catch (err) {
        console.error("Error in grantOwnerRole:", err);
        const message = err.message ||
            "An internal error occurred while setting claims.";
        return { error: "Internal Server Error", message };
    }
});
exports.createStadiumAndCoach = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    var _a, _b, _c;
    const ownerUid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const ownerRole = (_b = request.auth) === null || _b === void 0 ? void 0 : _b.token.role;
    const organizationId = (_c = request.auth) === null || _c === void 0 ? void 0 : _c.token.organizationId;
    if (!ownerUid || ownerRole !== "owner" || !organizationId) {
        return {
            error: "Forbidden",
            message: "Only authenticated owners can perform this action.",
        };
    }
    const { stadiumName, location, coachFullName, coachEmail, coachPhone, coachUsername, coachPassword, } = request.data;
    if (!stadiumName || !location || !coachFullName || !coachEmail ||
        !coachPhone || !coachUsername || !coachPassword) {
        return { error: "Bad Request", message: "Missing required fields." };
    }
    const db = admin.firestore();
    const auth = admin.auth();
    try {
        // --- Validation Checks ---
        const stadiumQuery = db.collection("stadiums")
            .where("name", "==", stadiumName)
            .where("organizationId", "==", organizationId);
        if (!(await stadiumQuery.get()).empty) {
            return {
                error: "Conflict",
                field: "stadiumName",
                message: "A stadium with this name already exists.",
            };
        }
        const emailQuery = db.collection("users").where("email", "==", coachEmail);
        if (!(await emailQuery.get()).empty) {
            return {
                error: "Conflict",
                field: "coachEmail",
                message: "This email address is already in use.",
            };
        }
        const usernameQuery = db.collection("users").where("username", "==", coachUsername);
        if (!(await usernameQuery.get()).empty) {
            return {
                error: "Conflict",
                field: "coachUsername",
                message: "This username is already taken.",
            };
        }
        // --- Creation Process ---
        const coachUserRecord = await auth.createUser({
            email: coachEmail,
            password: coachPassword,
            displayName: coachFullName,
            emailVerified: true,
        });
        const coachUid = coachUserRecord.uid;
        await auth.setCustomUserClaims(coachUid, {
            role: "coach",
            organizationId: organizationId,
            ownerId: ownerUid,
        });
        const stadiumDocRef = db.collection("stadiums").doc();
        const batch = db.batch();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        batch.set(stadiumDocRef, {
            name: stadiumName,
            location: location,
            organizationId: organizationId,
            assignedCoachId: coachUid,
            coachDetails: {
                name: coachFullName,
                email: coachEmail,
                username: coachUsername,
                phone: coachPhone,
            },
            status: "active",
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        const coachUserDocRef = db.collection("users").doc(coachUid);
        batch.set(coachUserDocRef, {
            uid: coachUid,
            email: coachEmail,
            username: coachUsername,
            fullName: coachFullName,
            role: "coach",
            ownerId: ownerUid,
            organizationId: organizationId,
            assignedStadiums: [stadiumDocRef.id],
            createdAt: timestamp,
        });
        await batch.commit();
        return {
            success: true,
            message: `Stadium '${stadiumName}' and Coach '${coachFullName}' created.`,
        };
    }
    catch (err) {
        console.error("Error in createStadiumAndCoach:", err);
        const error = err;
        if (error.code && error.code.startsWith("auth/")) {
            return { error: "Auth Error", message: error.message };
        }
        return {
            error: "Internal Server Error",
            message: error.message || "An internal error occurred.",
        };
    }
});
exports.syncUserRole = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    var _a;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        return {
            error: "Unauthorized",
            message: "Authentication is required.",
        };
    }
    try {
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return {
                error: "Not Found",
                message: "User document not found in Firestore.",
            };
        }
        const userData = userDoc.data();
        if (!userData) {
            return {
                error: "Not Found",
                message: "User data is empty.",
            };
        }
        const userRole = userData.role;
        const organizationId = userData.organizationId;
        const validRoles = ["owner", "super-admin"];
        if (validRoles.includes(userRole)) {
            const claims = { role: userRole };
            if (userRole === "owner" && organizationId) {
                claims.organizationId = organizationId;
            }
            const currentUser = await admin.auth().getUser(uid);
            const currentClaims = currentUser.customClaims || {};
            let claimsChanged = false;
            if (currentClaims.role !== claims.role ||
                (claims.organizationId &&
                    currentClaims.organizationId !== claims.organizationId)) {
                claimsChanged = true;
            }
            if (claimsChanged) {
                await admin.auth().setCustomUserClaims(uid, claims);
                console.log(`Claims set for user ${uid}:`, claims);
                return {
                    success: true,
                    message: `Role '${userRole}' synced to custom claims.`,
                    claims: claims,
                };
            }
            else {
                console.log(`Claims for user ${uid} are already up to date.`);
                return {
                    success: true,
                    message: "User claims are already up to date.",
                    claims: currentClaims,
                };
            }
        }
        else {
            console.log(`User ${uid} role ('${userRole}') not a syncable role.`);
            const currentUser = await admin.auth().getUser(uid);
            return {
                success: true,
                message: "User role does not require syncing.",
                claims: currentUser.customClaims || {},
            };
        }
    }
    catch (error) {
        console.error("Error in syncUserRole:", error);
        const message = error.message;
        return {
            error: "Internal Server Error",
            message,
        };
    }
});
//# sourceMappingURL=index.js.map