import type { Metadata } from "next"
import Link from "next/link"
import { searchSite } from "@/lib/local-search"

export const metadata: Metadata = {
  title: "Search",
  description: "Search Southville 8B NHS site content.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
}

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.toString() ?? ""

  const results = q ? searchSite(q) : { announcements: [], events: [] }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Search</h1>
      <form method="get" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search the site..."
          className="border rounded px-3 py-2 w-full max-w-xl"
        />
      </form>

      {q ? (
        <p className="text-muted-foreground">Showing results for: <span className="font-semibold">{q}</span></p>
      ) : (
        <p className="text-muted-foreground">Enter a query to search.</p>
      )}

      {q && (
        <div className="mt-8 grid gap-10">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Announcements</h2>
            {results.announcements.length ? (
              <ul className="space-y-3">
                {results.announcements.map((r) => (
                  <li key={r.url}>
                    <Link href={r.url} className="text-blue-600 hover:underline">
                      {r.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">{r.excerpt}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements found.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Events</h2>
            {results.events.length ? (
              <ul className="space-y-3">
                {results.events.map((r) => (
                  <li key={r.url}>
                    <Link href={r.url} className="text-blue-600 hover:underline">
                      {r.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">{r.excerpt}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No events found.</p>
            )}
          </section>

          <div>
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export const revalidate = 60
