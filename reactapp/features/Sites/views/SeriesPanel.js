import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Offcanvas } from "react-bootstrap";
import useLayoutStore from "stores/useLayoutStore";
// import SeriesPanelControl from "features/Sites/components/VariablesControlMenu";
import SiteSeries from "features/Sites/components/SiteSeries";
import { AppContext } from "features/react-tethys/context/context";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

export const StyledOffcanvas = styled(Offcanvas)`
  height: ${(props) => (props.$hasData ? "500px" : "100px")} !important;
`;

const SeriesPanel = () => {
  const { isTimeSeriesPanelVisible, toggleTimeSeriesPanelVisibility } =
    useLayoutStore();
  const { backend } = useContext(AppContext);
  const [seriesData, setSeriesData] = useState(null);

  // const handleGetValuesSubmit = (data) => {
  //   backend.do(backend.actions.GET_VALUES, { ...data });
  // };

  const handleGetValuesData = (data) => {
    if (data.error) {
      console.error(data.error);
      return;
    } else {
      if (data.series.length === 0) {
        console.log("No data found");
        return;
      } else {
        console.log("Series", data);
      }
    }
    setSeriesData(data);
  };
   

  useEffect(() => {
    backend.on(backend.actions.GET_VALUES, handleGetValuesData);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_VALUES);
    };
  }, [backend]);

  // Determine if we have series data
  const hasData = seriesData && seriesData.series && seriesData.series.length > 0;

  return (
    <StyledOffcanvas
      show={isTimeSeriesPanelVisible}
      onHide={toggleTimeSeriesPanelVisibility}
      placement="bottom"
      scroll
      backdrop={false}
      $hasData={hasData} // pass our boolean here
    >
      <Offcanvas.Body>
        <ParentSize>
          {({ width, height }) =>
            
              <SiteSeries
                width={width}
                height={height}
                series={seriesData}
              />
            
          }
        </ParentSize>
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
