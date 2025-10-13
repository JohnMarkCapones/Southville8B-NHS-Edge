import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { tag, secret } = await req.json()
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    if (!tag || typeof tag !== "string") {
      return NextResponse.json({ ok: false, error: "Missing tag" }, { status: 400 })
    }
    revalidateTag(tag)
    return NextResponse.json({ ok: true, tag })
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
