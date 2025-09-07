
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from './firebase'; // Adjust this import to your firebase initialization file

/**
 * Calls the setOwnerClaim Cloud Function to set the owner claim for the current user.
 */
export async function setOwnerClaim(): Promise<any> {
  try {
    const setOwnerClaimFunction = httpsCallable(functions, 'setOwnerClaim');
    const result = await setOwnerClaimFunction();
    return result.data;
  } catch (error) {
    console.error('Error calling setOwnerClaim function:', error);
    throw error;
  }
}
