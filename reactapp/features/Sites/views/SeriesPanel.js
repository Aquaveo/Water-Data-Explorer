import React,{useContext} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/useLayoutStore';
import VariableMenuForm from 'features/Sites/components/VariableMenuForm';


export const StyledOffcanvas = styled(Offcanvas)`
  .offcanvas-body {
    max-width: 100%;
  }
`;

const handleFormSubmit = (values) => {
  console.log("Form submitted:", values);
  // values.selectedVariable, values.startDate, values.endDate
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
                    Series
              </Offcanvas.Title>
          </Offcanvas.Header>
          
      <Offcanvas.Body>
          <VariableMenuForm variableList={variableList} onSubmit={handleFormSubmit} />
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
