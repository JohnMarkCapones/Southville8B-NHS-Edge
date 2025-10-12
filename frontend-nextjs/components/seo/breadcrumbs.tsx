"use client"

import Link from "next/link"

export type Crumb = { name: string; href: string }

export function Breadcrumbs({ items, current }: { items: Crumb[]; current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1 && !current
          return (
            <li key={item.href} className="flex items-center">
              {isLast ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:underline">
                  {item.name}
                </Link>
              )}
              {idx < items.length - 1 || current ? <span className="mx-2 opacity-60">/</span> : null}
            </li>
          )
        })}
        {current && (
          <li aria-current="page" className="font-medium text-foreground">
            {current}
          </li>
        )}
      </ol>
    </nav>
  )
}
