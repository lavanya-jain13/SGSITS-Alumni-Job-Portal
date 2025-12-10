import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsProfile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Settings & Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and profile details.
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Settings navigation will appear here.
        </p>
      </CardContent>
    </Card>
  );
}
