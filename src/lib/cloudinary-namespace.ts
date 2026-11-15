/**
 * Only assets uploaded under KINGDROPP's own Cloudinary folder may be
 * removed by its cleanup routines. Historic or copied public IDs are
 * deliberately preserved until separately reviewed.
 */
export function isKingdroppManagedPublicId(
  publicId: string | null | undefined,
): publicId is string {
  return typeof publicId === "string" &&
    publicId.startsWith("kingdropp/") &&
    !publicId.includes("..") &&
    publicId.length > "kingdropp/".length;
}
