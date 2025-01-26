import React,{ useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import { Offcanvas } from 'react-bootstrap';
import useLayoutStore from 'stores/useLayoutStore';
import VariableMenuForm from 'features/Sites/components/VariableMenuForm';
import SiteSeries from 'features/Sites/components/SiteSeries';
import { AppContext } from "features/react-tethys/context/context";
import ParentSize from '@visx/responsive/lib/components/ParentSize';


export const StyledOffcanvas = styled(Offcanvas)`
  height: 500px !important;
`;


const SeriesPanel = ({variableList}) => {
  const { isTimeSeriesPanelVisible, toggleTimeSeriesPanelVisibility } = useLayoutStore();
  const { backend } = useContext(AppContext);
  const [seriesData, setSeriesData] = useState(null);

  const handleGetValuesSubmit = (data) => {
    backend.do(backend.actions.GET_VALUES, {...data});
  };
  

  const handleGetValuesData = (data) => {
    console.log("Series", data);
    setSeriesData(data);
  }


  useEffect(() => {
    backend.on(backend.actions.GET_VALUES, handleGetValuesData);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_VALUES);
    };
  }, []);


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
          <VariableMenuForm variableList={variableList} onSubmit={handleGetValuesSubmit} />
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>

           <ParentSize>
           {({ width, height }) => 
                     seriesData &&
                     <SiteSeries width={width} height={height} data={seriesData.series} layout={seriesData.layout}/>
             }
          </ParentSize>

      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
