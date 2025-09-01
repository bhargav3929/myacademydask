import { SecurityRulesGenerator } from "@/components/security-rules/generator";

export default function SecurityRulesPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Security Rules Generator</h2>
          <p className="text-muted-foreground">
            Generate Firestore security rules using AI based on your data structure.
          </p>
        </div>
      </div>
      <SecurityRulesGenerator />
    </div>
  );
}
