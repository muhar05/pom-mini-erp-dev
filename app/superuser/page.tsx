export default function SuperuserDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard Superuser</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <p>Total Users</p>
          <span className="text-2xl font-bold">32</span>
        </div>

        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <p>Active Roles</p>
          <span className="text-2xl font-bold">5</span>
        </div>

        <div className="p-4 border rounded-lg bg-card text-card-foreground">
          <p>Pending Requests</p>
          <span className="text-2xl font-bold">3</span>
        </div>
      </div>
    </div>
  );
}
