export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>
      {/* Navbar placeholder — Phase 15 */}
      {children}
      {/* Footer placeholder — Phase 15 */}
    </div>
  );
}