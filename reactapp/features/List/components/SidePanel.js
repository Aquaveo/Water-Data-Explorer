import React,{useContext} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/layoutStore';
import CatalogsList from './CatalogList';
import ImportCatalogMenu from 'features/Catalogs/components/ImportCatalogMenu';
import { BsArrowLeft } from 'react-icons/bs';


export const StyledOffcanvas = styled(Offcanvas)`
  margin-top: var(--ts-header-height);
  width: 600px !important; 
  .offcanvas-body {
    max-width: 100%;
  }
`;


const SidePanel = () => {

  const { 
    isSidePanelVisible, 
    toggleSidePanelVisibility, 
    currentOffCanvasView 
  } = useLayoutStore();


  let content;
  if (currentOffCanvasView === 'catalogList') {
    content = <CatalogsList />;
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

export default SidePanel;
