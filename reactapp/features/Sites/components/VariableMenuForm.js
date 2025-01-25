import React, { useState, useEffect } from "react";
import { Form, Button, Dropdown, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import useDataStore from '../hooks/useDataStore';

import "react-datepicker/dist/react-datepicker.css";

const VariableMenuForm = ({ variableList = [], onSubmit }) => {
  const [selectedVariable, setSelectedVariable] = useState("");
  const [selectedVariableName, setSelectedVariableName] = useState("Select Variable");
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
        setSelectedVariableName(firstItem.variableName || "Select Variable");
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
    console.log(current_site);
    onSubmit({
      site_code: selectedVariable.split("_")[0],
      variable_code: selectedVariable.split("_")[1],
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      type: current_site.type,
      service_url: current_site.service_url
    });
  };

  const handleSelectVariable = (value, variableName) => {
    setSelectedVariable(value);
    setSelectedVariableName(variableName);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-center">
        
        <Col md="auto">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              {selectedVariableName}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {variableList.map((item, index) => {
                const value = `${item.siteCode}_${item.variableCode}`;
                return (
                  <Dropdown.Item
                    key={index}
                    onClick={() =>
                      handleSelectVariable(value, item.variableName)
                    }
                  >
                    {`${item.variableName}-${item.dataType ? item.dataType : ""}`}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md="auto">
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
          />
        </Col>
        <Col md="auto">
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
          />
        </Col>
        <Col md="auto">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default VariableMenuForm;
