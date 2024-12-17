// features/Catalogs/components/menu.js
import React from 'react';
import useLayoutStore from 'stores/layoutStore';
import { StyledOffcanvas } from './styledComponents';


const CatalogMenu = () => {
  const { isSidePanelVisible, toggleSidePanelVisibility } = useLayoutStore();

  return (
    <StyledOffcanvas  
      show={isSidePanelVisible} 
      onHide={toggleSidePanelVisibility} 
      placement="start" // Offcanvas from the left side
      scroll={true} // Allow scrolling
      backdrop={false} // Show backdrop
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default CatalogMenu;
