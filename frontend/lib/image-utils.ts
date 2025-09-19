/**
 * Utility functions for handling image URLs
 */

/**
 * Get the full URL for an image, handling both relative and absolute URLs
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The full URL for the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/assets/courses/default.svg';
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${apiUrl}${imageUrl}`;
}

/**
 * Get the full URL for a course thumbnail
 * @param thumbnail - The thumbnail URL
 * @returns The full URL for the thumbnail
 */
export function getCourseThumbnailUrl(thumbnail: string | null | undefined): string {
  return getImageUrl(thumbnail);
}

/**
 * Get the full URL for a course banner image
 * @param bannerImage - The banner image URL
 * @returns The full URL for the banner image
 */
export function getCourseBannerUrl(bannerImage: string | null | undefined): string {
  return getImageUrl(bannerImage);
}

/**
 * Get the full URL for a lesson video
 * @param videoFile - The video file URL
 * @returns The full URL for the video file
 */
export function getLessonVideoUrl(videoFile: string | null | undefined): string {
  return getImageUrl(videoFile);
}

/**
 * Get the full URL for a lesson material
 * @param materialFile - The material file URL
 * @returns The full URL for the material file
 */
export function getLessonMaterialUrl(materialFile: string | null | undefined): string {
  return getImageUrl(materialFile);
}

/**
 * Get the full URL for a course resource
 * @param resourceFile - The resource file URL
 * @returns The full URL for the resource file
 */
export function getCourseResourceUrl(resourceFile: string | null | undefined): string {
  return getImageUrl(resourceFile);
}
