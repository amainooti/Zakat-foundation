export default function DashboardPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">
          Welcome back — here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Placeholder grid — will be filled in Phase 16 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {["Total Raised", "Active Campaigns", "Total Donors", "Newsletter Subscribers"].map(
          (label) => (
            <div key={label} className="card p-5">
              <p className="text-xs text-text-muted mb-3 uppercase tracking-widest font-medium">
                {label}
              </p>
              <div className="skeleton h-7 w-24 rounded" />
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card p-5">
          <p className="text-xs text-text-muted mb-4 uppercase tracking-widest font-medium">
            Recent Donations
          </p>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-4 w-4 rounded-full" />
                <div className="skeleton h-3 flex-1 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs text-text-muted mb-4 uppercase tracking-widest font-medium">
            Campaign Progress
          </p>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="skeleton h-3 w-32 rounded mb-2" />
                <div className="skeleton h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}