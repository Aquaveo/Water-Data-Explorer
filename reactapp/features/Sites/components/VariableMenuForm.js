import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";


const VariableMenuForm = ({ variableList = [], onSubmit }) => {
  const [selectedVariable, setSelectedVariable] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timeSupport, setTimeSupport] = useState(60); // default intervals
  const [timeUnitName, setTimeUnitName] = useState("days"); // default 'days'

  useEffect(() => {
    if (variableList.length > 0) {
      const firstItem = variableList[0];
      setSelectedVariable(
        firstItem.siteCode && firstItem.variableCode
          ? `${firstItem.siteCode}_${firstItem.variableCode}`
          : ""
      );
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

  // minDate and maxDate define the boundaries
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
    console.log("Form submitted:", {
        selectedVariable,
        startDate,
        endDate,
        });
    e.preventDefault();
    onSubmit({
      selectedVariable,
      startDate:startDate.toISOString(),
      endDate:  endDate.toISOString(),
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="variableSelect">
        <Form.Label>Select Variable</Form.Label>
        <select
          className="form-control"
          value={selectedVariable}
          onChange={(e) => setSelectedVariable(e.target.value)}
        >
          {variableList.map((item, index) => {
            const value = `${item.siteCode}_${item.variableCode}`;
            return (
              <option key={index} value={value}>
                {item.variable_name}
              </option>
            );
          })}
        </select>
      </Form.Group>

      <Form.Group controlId="startDate">
        <Form.Label>Start Date</Form.Label>
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
          />
      </Form.Group>

      <Form.Group controlId="endDate">
        <Form.Label>End Date</Form.Label>
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
          />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default VariableMenuForm;
