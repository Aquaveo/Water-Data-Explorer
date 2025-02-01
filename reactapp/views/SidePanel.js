import React,{useContext} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/useLayoutStore';
import SitesList from '../features/Sites/components/SitesList';
import ImportSitesFromCatalogMenu from 'features/Cuahsi/components/menus/ImportSites';
import ImportSitesFromHydroServer2Menu from 'features/HydroServer2/components/menus/ImportSites';
import { BsArrowLeft } from 'react-icons/bs';


export const StyledOffcanvas = styled(Offcanvas)`
  margin-top: var(--ts-header-height);
  width: 700px !important; 
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
  switch (currentOffCanvasView) {
    case 'siteList':
      content = <SitesList />;
      break;
    case 'importCatalogMenu':
      content = <ImportSitesFromCatalogMenu />;
      break;
    case 'importHydroServerMenu':
      content = <ImportSitesFromHydroServer2Menu />;
      break;
    default:
      content = null;
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
              <Offcanvas.Title>
                <BsArrowLeft 
                  size={24} 
                  style={{ cursor: 'pointer', marginRight: '10px' }} 
                  onClick={toggleSidePanelVisibility} 
                />
                  
                  {currentOffCanvasView != 'siteList' ?
                    <div>
                      <div style={{display: 'inline-block'}}>Import Sites</div>
                    </div>                    
                  :
                    <div>
                      <div style={{display: 'inline-block'}}>Sites</div>
                    </div>
                  }
              </Offcanvas.Title>
          </Offcanvas.Header>
          
          


      <Offcanvas.Body>
        {content}
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SidePanel;
