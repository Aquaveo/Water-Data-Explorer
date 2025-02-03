import React from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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
    <OverlayTrigger
      placement="left"
      overlay={
        <Tooltip>
          {tooltipText}
        </Tooltip>
      }
    >
      <Button
        onClick={onClick}
        
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
          transition: 'background-color 0.3s, transform 0.3s', 
          ...(imageUrl ? { overflow: 'hidden' } : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = imageUrl ? '#fff' : '#fff';
          e.currentTarget.style.transform = 'scale(1)';
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
      </Button>
    </OverlayTrigger>
  );
}

export default CircularButton;
