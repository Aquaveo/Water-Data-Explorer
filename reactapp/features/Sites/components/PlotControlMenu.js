import React from "react";
import {
  Button,
  Row,
  Col,
} from "react-bootstrap";

import { MdOpenInFull, MdSsidChart, MdDownload  } from "react-icons/md";

const PlotControlMenu = ({ 
    onZoomReset, 
    onDownload, 
    OnScaleChange 
}) => {
  return (
    <Row className="align-items-center">
      <Col md="auto">
        <Button variant="outline-primary" size="sm" onClick={onZoomReset}>
            <MdOpenInFull size={10}  />
        </Button>
        <Button variant="outline-primary" size="sm" onClick={onDownload}>
            <MdDownload size={10}  />
        </Button>
        <Button variant="outline-primary" size="sm" onClick={OnScaleChange}>
            <MdSsidChart size={10}  />
        </Button>
      </Col>
    </Row>
  );
};

export default PlotControlMenu;