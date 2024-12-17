import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/layoutStore';
import { StyledOffcanvas } from './styledComponents';
import CatalogList from './catalogList'; // Import the new component
import { BsArrowLeft } from 'react-icons/bs';

const CatalogMenu = () => {
  const { isSidePanelVisible, toggleSidePanelVisibility } = useLayoutStore();

  const handleAdd = () => {
    console.log('Add button clicked');
    // Implement your "add" functionality here
  };

  const handleDelete = () => {
    console.log('Delete button clicked');
    // Implement your "delete" functionality here
  };

  const handleFilter = () => {
    console.log('Filter button clicked');
    // Implement your "filter" functionality here
  };

  return (
    <StyledOffcanvas
      show={isSidePanelVisible}
      onHide={toggleSidePanelVisibility}
      placement="start"
      scroll={true}
      backdrop={false}
    >
      <Offcanvas.Header>
        <BsArrowLeft 
          size={24} 
          style={{ cursor: 'pointer', marginRight: '10px' }} 
          onClick={toggleSidePanelVisibility} 
        />
        <Offcanvas.Title>
          My Catalogs
        </Offcanvas.Title>
      </Offcanvas.Header>
        <Offcanvas.Body>

        <CatalogList />
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default CatalogMenu;