import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Offcanvas } from "react-bootstrap";
import useLayoutStore from "stores/useLayoutStore";
import useToastStore from "hooks/useToastStore";
import SiteSeries from "features/Sites/components/SiteSeries";
import { AppContext } from "features/react-tethys/context/context";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

export const StyledOffcanvas = styled(Offcanvas)`
  height: ${(props) => (props.$hasData ? "550px" : "fit-content")} !important;
`;

const SeriesPanel = () => {
  const { isTimeSeriesPanelVisible, toggleTimeSeriesPanelVisibility } = useLayoutStore();
  const { updateToSuccessToast, updateToErrorToast } = useToastStore();
  const { backend } = useContext(AppContext);
  const [data, setData] = useState(null);

  const handleGetValuesData = (data) => {
    if (data.error) {
      console.error(data.error);
      updateToErrorToast(data.error);
      return;
    } else {
      setData({ ...data });
      updateToSuccessToast();
    }
  };
   
  useEffect(() => {
    backend.on(backend.actions.GET_VALUES, handleGetValuesData);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_VALUES);
    };
  }, [backend]);

  // Determine if we have series data
  const hasData = data && data.series && data.series.length > 0;

  return (
    <StyledOffcanvas
      show={isTimeSeriesPanelVisible}
      onHide={toggleTimeSeriesPanelVisibility}
      placement="bottom"
      scroll
      backdrop={false}
      $hasData={hasData}
    >
      <Offcanvas.Body>
        <div style={{ flex: '1 1 0', height: '90%', position: 'relative'}}>
          <ParentSize>
            {({ width, height }) =>
              <SiteSeries
                width={width}
                height={height}
                data={data}
              />
            }
          </ParentSize>
        </div>
      </Offcanvas.Body>
    </StyledOffcanvas>
  );
};

export default SeriesPanel;
