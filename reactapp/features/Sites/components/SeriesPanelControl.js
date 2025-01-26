import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Dropdown,
  Row,
  Col,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaExpandArrowsAlt, FaArrowRight, FaHourglassStart, FaHourglassEnd, FaChartArea,FaDownload  } from "react-icons/fa";
import useDataStore from "../hooks/useDataStore";

import "react-datepicker/dist/react-datepicker.css";

const SeriesPanelControl = ({ variableList = [], onSubmit }) => {
  const [selectedVariable, setSelectedVariable] = useState("");
  const [selectedVariableName, setSelectedVariableName] = useState(
    "Select Variable"
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timeSupport, setTimeSupport] = useState(60);
  const [timeUnitName, setTimeUnitName] = useState("days");
  const current_site = useDataStore((state) => state.getCurrentSite());

  useEffect(() => {
    if (variableList.length > 0) {
      const firstItem = variableList[0];
      const defaultVariable =
        firstItem.siteCode && firstItem.variableCode
          ? `${firstItem.siteCode}_${firstItem.variableCode}`
          : "";
      setSelectedVariable(defaultVariable);
      // Make the dropdown toggle text match the full item label
      const firstItemLabel = `${firstItem.variableName}${
        firstItem.dataType ? ` - ${firstItem.dataType}` : ""
      }`;
      setSelectedVariableName(firstItemLabel || "Select Variable");

      setStartDate(
        firstItem.beginDateTime ? new Date(firstItem.beginDateTime) : new Date()
      );
      setEndDate(
        firstItem.endDateTime ? new Date(firstItem.endDateTime) : new Date()
      );

      if (firstItem.timeSupport) {
        setTimeSupport(parseInt(firstItem.timeSupport, 10) || 60);
      }
      if (firstItem.timeUnitName) {
        setTimeUnitName(firstItem.timeUnitName.toLowerCase());
      }
    }
  }, [variableList]);

  const minDate = startDate;
  const maxDate = endDate;
  const isMinutes = timeUnitName === "min";
  const isYears = timeUnitName === "years";

  let dateFormat = "MMMM d, yyyy";
  let showTimeSelect = false;
  let showYearPicker = false;
  let usedTimeIntervals = 60;

  if (isMinutes) {
    showTimeSelect = true;
    dateFormat = "MMMM d, yyyy h:mm aa";
    usedTimeIntervals = timeSupport;
  } else if (isYears) {
    showYearPicker = true;
    dateFormat = "yyyy";
    showTimeSelect = false;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      site_code: selectedVariable.split("_")[0],
      variable_code: selectedVariable.split("_")[1],
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      type: current_site?.type,
      service_url: current_site?.service_url,
    });
  };

  const handleSelectVariable = (value, item) => {
    setSelectedVariable(value);
    // Construct the same text used in the dropdown option:
    const label = `${item.variableName}${item.dataType ? ` - ${item.dataType}` : ""}`;
    setSelectedVariableName(label);
  };

  return (
    <Row className="align-items-center">
      {/* Main Form */}
      <Col md="auto">
        <Form onSubmit={handleSubmit}>
          <Row className="align-items-center">
            {/* Dropdown Column */}
            <Col md="auto">
              
              <div className="d-flex align-items-center">
                <FaChartArea  size={30} style={{ marginRight: "5px" }} />
                <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic">
                      {selectedVariableName}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {variableList.map((item, index) => {
                        const value = `${item.siteCode}_${item.variableCode}`;
                        const label = `${item.variableName}${
                          item.dataType ? ` - ${item.dataType}` : ""
                        }`;
                        return (
                          <Dropdown.Item
                            key={index}
                            onClick={() => handleSelectVariable(value, item)}
                          >
                            {label}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
              </div>
            </Col>

            {/* Start Date Column */}
            <Col md="auto">
              <div className="d-flex align-items-center">
                <FaHourglassStart style={{ marginRight: "5px" }} />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  minDate={minDate}
                  maxDate={maxDate}
                  showTimeSelect={showTimeSelect}
                  showYearPicker={showYearPicker}
                  timeFormat="HH:mm"
                  timeIntervals={usedTimeIntervals}
                  timeCaption="Time"
                  dateFormat={dateFormat}
                  placeholderText="Start Date"
                  className="form-control"
                />
              </div>
            </Col>

            {/* End Date Column */}
            <Col md="auto">
              <div className="d-flex align-items-center">
                <FaHourglassEnd style={{ marginRight: "5px" }} />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  minDate={minDate}
                  maxDate={maxDate}
                  showTimeSelect={showTimeSelect}
                  showYearPicker={showYearPicker}
                  timeFormat="HH:mm"
                  timeIntervals={usedTimeIntervals}
                  timeCaption="Time"
                  dateFormat={dateFormat}
                  placeholderText="End Date"
                  className="form-control"
                />
              </div>
            </Col>

            <Col md="auto">
              <Button variant="primary" type="submit">
                <FaArrowRight />
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>

      <Col md="auto">
        <Row>
          <Col md="auto">
            <Button variant="primary" onClick={() => console.log("Expand")}>
              <FaExpandArrowsAlt />
            </Button>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={() => console.log("Download")}>
              <FaDownload />
            </Button>
          </Col>
        </Row>


      </Col>
    </Row>
  );
};

export default SeriesPanelControl;
