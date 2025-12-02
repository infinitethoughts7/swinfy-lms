import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
  disableLink?: boolean;
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  href = '/', 
  className = '',
  textClassName = '',
  disableLink = false
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-6 h-4',
      dot: 'w-1.5 h-1.5',
      text: 'text-lg',
      spacing: 'space-x-1.5'
    },
    md: {
      container: 'w-8 h-6',
      dot: 'w-2 h-2',
      text: 'text-2xl',
      spacing: 'space-x-2'
    },
    lg: {
      container: 'w-10 h-8',
      dot: 'w-2.5 h-2.5',
      text: 'text-3xl lg:text-4xl',
      spacing: 'space-x-3'
    }
  };

  const sizes = sizeClasses[size];

  const logoContent = (
    <div className={`flex items-center ${sizes.spacing} ${className}`}>
      {/* Four Color Parallelogram Logo - Just 4 Dots */}
      <div className={`${sizes.container} relative`}>
        {/* Blue dot - top left */}
        <div className={`absolute top-0.5 left-0.5 ${sizes.dot} bg-blue-500 rounded-full`}></div>
        
        {/* Green dot - top right */}
        <div className={`absolute top-0.5 ${size === 'sm' ? 'left-4' : size === 'md' ? 'left-5' : 'left-6'} ${sizes.dot} bg-green-500 rounded-full`}></div>
        
        {/* Yellow dot - bottom left */}
        <div className={`absolute ${size === 'sm' ? 'top-2' : 'top-3'} ${size === 'sm' ? 'left-1' : 'left-2'} ${sizes.dot} bg-yellow-500 rounded-full`}></div>
        
        {/* Red dot - bottom right */}
        <div className={`absolute ${size === 'sm' ? 'top-2' : 'top-3'} ${size === 'sm' ? 'left-5' : 'left-6'} ${sizes.dot} bg-red-500 rounded-full`}></div>
      </div>
      
      {showText && (
        <span className={`${sizes.text} font-bold ${textClassName || 'text-gray-900'}`}>
          OLLA
        </span>
      )}
    </div>
  );

  if (href && href !== '' && !disableLink) {
    return (
      <Link href={href} className="flex items-center" aria-label="OLLA - Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
