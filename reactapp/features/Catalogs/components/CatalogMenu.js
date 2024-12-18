import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/layoutStore';
import { StyledOffcanvas } from './styledComponents';
import CatalogList from './catalogList';
import ImportCatalogMenu from './ImportCatalogMenu';
import { BsArrowLeft } from 'react-icons/bs';

const CatalogMenu = () => {
  const { 
    isSidePanelVisible, 
    toggleSidePanelVisibility, 
    currentOffCanvasView 
  } = useLayoutStore();

  let content;
  if (currentOffCanvasView === 'catalogList') {
    content = <CatalogList />;
  } else if (currentOffCanvasView === 'importCatalogMenu') {
    content = <ImportCatalogMenu />;
  }

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
          {currentOffCanvasView === 'catalogList' ? 'My Catalogs' : 'Import Catalog'}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {content}
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default CatalogMenu;
