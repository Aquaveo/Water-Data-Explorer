import React,{useContext} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/useLayoutStore';
import { BsArrowLeft } from 'react-icons/bs';


export const StyledOffcanvas = styled(Offcanvas)`
  .offcanvas-body {
    max-width: 100%;
  }
`;

const SeriesPanel = () => {

  const { 
    isTimeSeriesPanelVisible, 
    toggleTimeSeriesPanelVisibility, 
  } = useLayoutStore();


  let content = (
    <div>
      <p>Time Series Panel</p>
    </div>
  );


  return (
    <StyledOffcanvas
      show={isTimeSeriesPanelVisible}
      onHide={toggleTimeSeriesPanelVisibility}
      placement="bottom"
      scroll={true}
      backdrop={false}
    >
           <Offcanvas.Header>
              <Offcanvas.Title>
                    Series
              </Offcanvas.Title>
          </Offcanvas.Header>
          
      <Offcanvas.Body>
        {content}
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
