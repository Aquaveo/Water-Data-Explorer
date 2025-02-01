import React from 'react';

function CircularButton({
  icon,            // Provide a JSX element if you want to render an icon.
  imageUrl,        // Provide a URL if you want to render an image.
  altText = '',    // Alt text for the image.
  onClick,
  size = 50,
  tooltipText = '',
  style = {},
  top,             // Optional: override the default top position.
}) {
  // If not provided, default top is different depending on whether it's an image or icon.
  const defaultTop = imageUrl ? '200px' : '150px';
  const buttonTop = top || defaultTop;

  return (
    <button
      onClick={onClick}
      title={tooltipText} // Native tooltip on hover.
      style={{
        position: 'absolute',
        top: buttonTop,
        right: '10px',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: imageUrl ? '#fff' : 'transparent',
        border: '1px solid #ccc',
        cursor: 'pointer',
        ...(imageUrl ? { overflow: 'hidden' } : {}), // Ensure images don’t overflow.
        ...style,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={altText}
          style={{
            maxWidth: '80%',
            maxHeight: '80%',
            objectFit: 'contain',
          }}
        />
      ) : (
        icon
      )}
    </button>
  );
}

export default CircularButton;
