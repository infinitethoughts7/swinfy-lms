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
 * @param thumbnail - The thumbnail URL (legacy field)
 * @param thumbnailUrl - The direct thumbnail URL from API
 * @returns The full URL for the thumbnail
 */
export function getCourseThumbnailUrl(thumbnail: string | null | undefined, thumbnailUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (thumbnailUrl) {
    return thumbnailUrl;
  }
  // Fallback to legacy thumbnail field
  return getImageUrl(thumbnail);
}

/**
 * Get the full URL for a course banner image
 * @param bannerImage - The banner image URL (legacy field)
 * @param bannerImageUrl - The direct banner image URL from API
 * @returns The full URL for the banner image
 */
export function getCourseBannerUrl(bannerImage: string | null | undefined, bannerImageUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (bannerImageUrl) {
    return bannerImageUrl;
  }
  // Fallback to legacy banner image field
  return getImageUrl(bannerImage);
}

/**
 * Get the full URL for a profile picture
 * @param profilePicture - The profile picture URL (legacy field)
 * @param profilePictureUrl - The direct profile picture URL from API
 * @returns The full URL for the profile picture
 */
export function getProfilePictureUrl(profilePicture: string | null | undefined, profilePictureUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (profilePictureUrl) {
    return profilePictureUrl;
  }
  // Fallback to legacy profile picture field
  return getImageUrl(profilePicture);
}

/**
 * Get the full URL for an organization logo
 * @param logo - The logo URL (legacy field)
 * @param logoUrl - The direct logo URL from API
 * @returns The full URL for the logo
 */
export function getLogoUrl(logo: string | null | undefined, logoUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (logoUrl) {
    return logoUrl;
  }
  // Fallback to legacy logo field
  return getImageUrl(logo);
}

/**
 * Get the full URL for a file download
 * @param file - The file URL (legacy field)
 * @param fileUrl - The direct file URL from API
 * @returns The full URL for the file
 */
export function getFileUrl(file: string | null | undefined, fileUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (fileUrl) {
    return fileUrl;
  }
  // Fallback to legacy file field
  return getImageUrl(file);
}

/**
 * Get the full URL for a lesson video
 * @param videoFile - The video file URL (legacy field)
 * @param videoUrl - The direct video URL from API
 * @returns The full URL for the video file
 */
export function getLessonVideoUrl(videoFile: string | null | undefined, videoUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (videoUrl) {
    return videoUrl;
  }
  // Fallback to legacy video file field
  return getImageUrl(videoFile);
}

/**
 * Get the full URL for a lesson material
 * @param materialFile - The material file URL (legacy field)
 * @param materialFileUrl - The direct material file URL from API
 * @returns The full URL for the material file
 */
export function getLessonMaterialUrl(materialFile: string | null | undefined, materialFileUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (materialFileUrl) {
    return materialFileUrl;
  }
  // Fallback to legacy material file field
  return getImageUrl(materialFile);
}

/**
 * Get the full URL for a course resource
 * @param resourceFile - The resource file URL (legacy field)
 * @param resourceFileUrl - The direct resource file URL from API
 * @returns The full URL for the resource file
 */
export function getCourseResourceUrl(resourceFile: string | null | undefined, resourceFileUrl?: string | null): string {
  // Prioritize the direct URL from API (S3 URL)
  if (resourceFileUrl) {
    return resourceFileUrl;
  }
  // Fallback to legacy resource file field
  return getImageUrl(resourceFile);
}
