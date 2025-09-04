import React from 'react';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ size = 'md', src, alt, fallback }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-[var(--color-primary-blue)] flex items-center justify-center border-2 border-[var(--color-primary-blue)]`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
};

export default Avatar;