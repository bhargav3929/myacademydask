
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

admin.initializeApp();

// Allows a Super Admin to grant Owner role to a target user
export const grantOwnerRole = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      const tokenId = req.headers.authorization?.split("Bearer ")[1];
      if (!tokenId) {
        res.status(401).send({ error: "Unauthorized", message: "No token provided." });
        return;
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(tokenId);
        const callerRole = decodedToken.role;

        if (callerRole !== "super-admin") {
          res.status(403).send({ error: "Forbidden", message: "Only super-admins can grant owner roles." });
          return;
        }

        const { targetUid, organizationId } = req.body;
        if (!targetUid || !organizationId) {
          res.status(400).send({ error: "Bad Request", message: "Missing required fields: targetUid and organizationId." });
          return;
        }

        await admin.auth().setCustomUserClaims(targetUid, {
          role: "owner",
          organizationId: organizationId,
        });

        res.status(200).send({ success: true, message: `Owner role granted to user ${targetUid}.` });

      } catch (err: any) {
        console.error("Error in grantOwnerRole:", err);
        res.status(500).send({ error: "Internal Server Error", message: err.message || "An internal error occurred." });
      }
    });
  }
);

// Callable function to sync a user's role from Firestore to their Auth token claims
export const syncUserRole = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      const tokenId = req.headers.authorization?.split('Bearer ')[1];
      if (!tokenId) {
        res.status(401).send({ error: 'Unauthorized', message: 'No token provided.' });
        return;
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(tokenId);
        const uid = decodedToken.uid;

        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
          res.status(404).send({ error: 'Not Found', message: 'User document not found.' });
          return;
        }

        const { role, organizationId } = userDoc.data()!;
        const validRoles = ["owner", "super-admin"];

        if (validRoles.includes(role)) {
            let claims: {[key: string]: any} = { role };
            if (role === "owner" && organizationId) {
                claims.organizationId = organizationId;
            }

            await admin.auth().setCustomUserClaims(uid, claims);
            console.log(`Claims successfully set for user ${uid}:`, claims);
            res.status(200).send({ success: true, message: `Role '${role}' synced to custom claims.` });
        } else {
          console.log(`User ${uid} role ('${role}') requires no special claims.`);
          res.status(200).send({ success: true, message: "No claims to set." });
        }
      } catch (error: any) {
        console.error("Error in syncUserRole:", error);
        res.status(500).send({ error: 'Internal Server Error', message: error.message });
      }
    });
  }
);


export const createCoachUser = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      // 1. Authentication and Authorization Check
      const tokenId = req.headers.authorization?.split("Bearer ")[1];
      if (!tokenId) {
        res.status(401).send({ error: "Unauthorized", message: "No token provided." });
        return;
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(tokenId);
      } catch (error) {
        res.status(401).send({ error: "Unauthorized", message: "Invalid token." });
        return;
      }

      const role = (decodedToken.role) || null;
      if (role !== "owner") {
        res.status(403).send({ error: "Forbidden", message: "Only owners can create coach users." });
        return;
      }

      // 2. Input validation
      const { email, password, displayName, coachUsername } = req.body;
      if (!email || !password || !displayName) {
        res.status(400).send({ error: "Bad Request", message: "Missing required fields." });
        return;
      }

      // 3. Logic
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName,
          emailVerified: true,
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: "coach",
          ownerId: decodedToken.uid,
        });

        await admin.firestore().collection("users").doc(userRecord.uid).set({
          uid: userRecord.uid,
          email,
          username: coachUsername || null,
          fullName: displayName,
          role: "coach",
          ownerId: decodedToken.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("createCoachUser success uid:", userRecord.uid);
        res.status(200).send({ success: true, uid: userRecord.uid });
      } catch (err: any) {
        console.error("createCoachUser error:", err);
        if (err.code && err.code.startsWith("auth/")) {
            res.status(409).send({ error: "Conflict", message: err.message });
        } else {
            res.status(500).send({ error: "Internal Server Error", message: err.message || "Internal error" });
        }
      }
    });
  }
);
