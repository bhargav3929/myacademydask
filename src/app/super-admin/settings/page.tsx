
import { MotionDiv } from "@/components/motion";
import { SettingsForm } from "@/components/super-admin/settings-form";

export default function SuperAdminSettingsPage() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account and currency settings.
          </p>
        </div>
      </div>
      
      <SettingsForm />

    </MotionDiv>
  );
}
