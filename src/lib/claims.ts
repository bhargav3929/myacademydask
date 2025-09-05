
import { adminAuth } from "./firebase-admin";

/**
 * Sets custom claims for a user.
 *
 * @param {string} uid - The user ID.
 * @param {object} claims - The custom claims to set.
 * @returns {Promise<void>}
 */
export async function setCustomUserClaims(uid: string, claims: object): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    console.log(`Custom claims set for user ${uid}`, claims);
  } catch (error) {
    console.error(`Error setting custom claims for user ${uid}`, error);
    throw error;
  }
}
