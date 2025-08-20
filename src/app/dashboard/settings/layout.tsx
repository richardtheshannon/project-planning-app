export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and settings.
        </p>
      </div>

      {/* The flex container and the <aside> element have been removed.
        The children will now render directly, taking up the full width available.
      */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
