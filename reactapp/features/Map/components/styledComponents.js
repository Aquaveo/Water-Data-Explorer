import styled from 'styled-components';
import Offcanvas from 'react-bootstrap/Offcanvas';


export const StyledMapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  position: 'relative';
`;

export const ControlButton = styled.button`
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute; 
  bottom: 50px; 
  left: 10px;
  &:hover {
    background: #444;
  }
`;


export const StyledOffcanvas = styled(Offcanvas)`
  bottom: 100px;
`;



export const AddMenuButtonContainer = styled.button`
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute; 
  bottom: 100px; 
  left: 10px;
  &:hover {
    background: #444;
  }
`;
