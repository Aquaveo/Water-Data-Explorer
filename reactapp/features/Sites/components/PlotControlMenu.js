import React from "react";
import {
  Button,
  Row,
  Col
} from "react-bootstrap";

import { MdOpenInFull, MdDownload  } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const PlotControlMenu = ({ 
    onZoomReset, 
    onDownload, 
    OnScaleChange 
}) => {
  return (
    <Row className="align-items-center justify-content-end">
      <Col md="auto">
        <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                Reset Zoom.
              </Tooltip>
            }
          >
            <Button variant="outline-primary" onClick={onZoomReset}>
                <MdOpenInFull size={20}  />
            </Button>
        </OverlayTrigger>
        <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                Download to csv.
              </Tooltip>
            }
          >
            <Button variant="outline-primary" onClick={onDownload}>
                <MdDownload size={20}  />
            </Button>
        </OverlayTrigger>

        <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                Change scale log/linear.
              </Tooltip>
            }
          >
          <Button variant="outline-primary" onClick={OnScaleChange}>
              <FaExchangeAlt   size={20}  />
          </Button>
        </OverlayTrigger>
      </Col>
    </Row>
  );
};

export default PlotControlMenu;