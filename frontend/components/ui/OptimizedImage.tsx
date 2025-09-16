'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * OptimizedImage component that automatically handles SVGs with regular img tags
 * and other formats with Next.js Image optimization
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  fallbackSrc,
  onError,
  ...props
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    onError?.(e);
  };

  // Use regular img tag for SVGs to avoid Next.js optimization issues
  if (imgSrc.endsWith('.svg')) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        {...props}
      />
    );
  }

  // Use Next.js Image for other formats (PNG, JPG, WebP, etc.)
  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        onError={handleError}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      priority={priority}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
