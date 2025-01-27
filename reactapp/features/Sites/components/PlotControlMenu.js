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
        <Button variant="primary" onClick={onZoomReset}>
            <MdOpenInFull  />
        </Button>
      </Col>
      <Col md="auto">
        <Button variant="primary" onClick={onDownload}>
            <MdDownload   />
        </Button>
      </Col>
      <Col md="auto">
        <Button variant="primary" onClick={OnScaleChange}>
            <MdSsidChart   />
        </Button>
      </Col>
    </Row>
  );
};

export default PlotControlMenu;