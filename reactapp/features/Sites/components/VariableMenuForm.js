import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VariableMenuForm = ({ variableList = [], onSubmit }) => {
  // Log the list to confirm its data changes over time
  console.log("variableList:", variableList);

  // If there's no data, handle gracefully
  const firstItem = variableList[0] || {};

  // Convert the date strings into JS Date objects
  const firstBegin = firstItem.beginDateTime
    ? new Date(firstItem.beginDateTime)
    : new Date();
  const firstEnd = firstItem.endDateTime
    ? new Date(firstItem.endDateTime)
    : new Date();

  // Dropdown initial value
  const initialDropdownValue = firstItem.siteCode && firstItem.variableCode
    ? `${firstItem.siteCode}_${firstItem.variableCode}`
    : "";

  const [selectedVariable, setSelectedVariable] = useState(initialDropdownValue);

  // Date picker states
  const [startDate, setStartDate] = useState(firstBegin);
  const [endDate, setEndDate] = useState(firstEnd);

  // Whenever `variableList` changes, we re-parse the first item
  useEffect(() => {
    const item = variableList[0] || {};
    const newBegin = item.beginDateTime ? new Date(item.beginDateTime) : new Date();
    const newEnd = item.endDateTime ? new Date(item.endDateTime) : new Date();

    setStartDate(newBegin);
    setEndDate(newEnd);

    const newDropdownValue = 
      item.siteCode && item.variableCode
        ? `${item.siteCode}_${item.variableCode}`
        : "";
    setSelectedVariable(newDropdownValue);
  }, [variableList]);

  // Boundaries for the date pickers (min and max)
  const minDate = startDate;
  const maxDate = endDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      selectedVariable,
      startDate,
      endDate,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="variableSelect">
        <Form.Label>Select Variable</Form.Label>
        <Form.Control
          as="select"
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
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="startDate">
        <Form.Label>Start Date</Form.Label>
        <DatePicker
          selected={startDate}
          onChange={(date) => date && setStartDate(date)}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </Form.Group>

      <Form.Group controlId="endDate">
        <Form.Label>End Date</Form.Label>
        <DatePicker
          selected={endDate}
          onChange={(date) => date && setEndDate(date)}
          minDate={minDate}
          maxDate={maxDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={60}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default VariableMenuForm;
