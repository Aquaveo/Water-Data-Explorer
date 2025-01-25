import React,{useContext} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/useLayoutStore';
import VariableMenuForm from 'features/Sites/components/VariableMenuForm';


export const StyledOffcanvas = styled(Offcanvas)`
  height: 500px !important; 
  .offcanvas-body {
    max-width: 100%;

  }
`;

const handleFormSubmit = (values) => {
  console.log("Form submitted:", values);
};


const SeriesPanel = ({variableList}) => {

  const { 
    isTimeSeriesPanelVisible, 
    toggleTimeSeriesPanelVisibility, 
  } = useLayoutStore();

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
          <VariableMenuForm variableList={variableList} onSubmit={handleFormSubmit} />
        </Offcanvas.Title>
      </Offcanvas.Header>
          
      <Offcanvas.Body>
          
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
