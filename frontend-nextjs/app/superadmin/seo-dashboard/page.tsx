export default function SeoDashboard() {
  const pages = [
    { label: "Home", path: "/" },
    { label: "Events Index", path: "/guess/event" },
    { label: "News", path: "/guess/news" },
    { label: "Gallery", path: "/guess/gallery" },
    { label: "Academics", path: "/guess/academics" },
    { label: "Student Life", path: "/guess/student-life" },
  ]
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SEO Dashboard (Internal)</h1>
      <p className="text-muted-foreground">Quick links and placeholders for KPIs. This section is noindex.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((p) => (
          <a key={p.path} href={p.path} className="block border rounded-lg p-4 hover:shadow">
            <div className="font-medium">{p.label}</div>
            <div className="text-sm text-muted-foreground">{p.path}</div>
          </a>
        ))}
      </div>
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">KPIs</h2>
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>CWV (LCP/CLS/INP): —</li>
          <li>Impressions / Clicks / CTR / Position: —</li>
          <li>Index Coverage: —</li>
          <li>Conversions (if any): —</li>
        </ul>
      </div>
    </div>
  )
}
