"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  /** Extra query params to preserve (e.g. search term) */
  extraParams?: Record<string, string>
}

export function PaginationControls({
  currentPage,
  totalPages,
  extraParams = {},
}: PaginationControlsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    Object.entries(extraParams).forEach(([k, v]) => params.set(k, v))
    return `${pathname}?${params.toString()}`
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  // Generate page window: always show first, last, current ±1
  const pages: (number | "…")[] = []
  const add = (n: number) => {
    if (!pages.includes(n)) pages.push(n)
  }
  add(1)
  if (currentPage - 1 > 2) pages.push("…")
  if (currentPage > 2) add(currentPage - 1)
  add(currentPage)
  if (currentPage < totalPages - 1) add(currentPage + 1)
  if (currentPage + 1 < totalPages - 1) pages.push("…")
  add(totalPages)

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!hasPrev}
        asChild={hasPrev}
      >
        {hasPrev ? (
          <Link href={buildHref(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 text-sm"
            asChild={p !== currentPage}
          >
            {p !== currentPage ? (
              <Link href={buildHref(p as number)}>{p}</Link>
            ) : (
              <span>{p}</span>
            )}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={!hasNext}
        asChild={hasNext}
      >
        {hasNext ? (
          <Link href={buildHref(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
