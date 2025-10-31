// Maps a subject name to a local image asset. Extend as needed.
export function getSubjectAsset(subjectName: string) {
  const key = (subjectName || "").trim().toLowerCase();

  if (key.includes("math")) return require("@/assets/subjects/MATH.png");
  if (key.includes("english")) return require("@/assets/subjects/English.png");
  if (key.includes("science")) return require("@/assets/subjects/Science.png");
  if (key.includes("filipino"))
    return require("@/assets/subjects/Filipino.png");
  if (key.includes("esp") || key.includes("edukasyon"))
    return require("@/assets/subjects/ESP.png");
  if (key.includes("history") || key.includes("araling panlipunan"))
    return require("@/assets/subjects/AP.png");
  if (
    key.includes("mapeh") ||
    key.includes("pe") ||
    key.includes("music") ||
    key.includes("arts") ||
    key.includes("physical education")
  )
    return require("@/assets/subjects/MAPEH.png");

  // Fallback
  return require("@/assets/subjects/Spider.png");
}
