export const SITE_URL = "https://www.southville8bnhs.com"
export const SITE_NAME = "Southville 8B NHS"
export const DEFAULT_TITLE = "Southville 8B National High School"
export const DEFAULT_DESCRIPTION =
  "Excellence in education at Southville 8B National High School. Comprehensive academics, vibrant student life, and championship athletics."
export const TWITTER_HANDLE = "@southville8bnhs"
// Use an existing image as a fallback OG image
export const DEFAULT_OG_IMAGE = "/images/design-mode/image.png"

export function absoluteUrl(path: string) {
  // If path is already an absolute URL, return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  try {
    return new URL(path, SITE_URL).toString()
  } catch {
    return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`
  }
}
