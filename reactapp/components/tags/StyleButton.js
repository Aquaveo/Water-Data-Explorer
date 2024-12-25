// IconButton.js
import styled from 'styled-components';
import { MdClose } from 'react-icons/md'; // Using Material Design Close icon

const IconButton = styled.button`
  background: transparent; /* No background */
  border: none;            /* No border */
  cursor: pointer;         /* Pointer cursor on hover */
  align-items: center;     /* Center vertically */
  justify-content: center; /* Center horizontally */
  
  /* Remove default button styles on focus */
  &:focus {
    outline: none;
  }

  /* Optional: Slight opacity change on hover */
  &:hover {
    opacity: 0.7;
  }

  /* Optional: Transition for smooth hover effect */
  transition: opacity 0.2s ease-in-out;
`;

export const CloseButton = ({ onClick, ariaLabel = "Close" }) => (
  <IconButton onClick={onClick} aria-label={ariaLabel}>
    <MdClose size={15} /> {/* Adjust the size as needed */}
  </IconButton>
);
