"use client";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function ClaimsDebugger() {
  const [claims, setClaims] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true); // force refresh
          const tokenResult = await auth.currentUser.getIdTokenResult();
          console.log("Custom Claims:", tokenResult.claims);
          setClaims(tokenResult.claims);
        } else {
          setClaims(null);
        }
      } catch (err) {
        console.error("Error fetching claims:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="bg-gray-100 rounded-md p-4 mt-4">
      <h2 className="font-semibold text-lg">🔍 Claims Debugger</h2>
      {loading && <p>Loading claims…</p>}
      {!loading && claims && (
        <pre className="text-sm mt-2 bg-white p-2 rounded">
          {JSON.stringify(claims, null, 2)}
        </pre>
      )}
      {!loading && !claims && (
        <p className="text-red-500">No claims found (user not logged in).</p>
      )}
    </div>
  );
}
