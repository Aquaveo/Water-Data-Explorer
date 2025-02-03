import React, { useContext, useEffect, useState } from "react";
import {
  Form,
  Button,
  Dropdown,
  Row,
  Col,
  Container
} from "react-bootstrap";
import useLayoutStore from "stores/useLayoutStore";
import DatePicker from "react-datepicker";
import { FaHourglassStart, FaHourglassEnd, FaChartArea,FaChevronDown } from "react-icons/fa";
import useDataStore from "../hooks/useDataStore";
import useToastStore from "hooks/useToastStore";
import { AppContext } from "features/react-tethys/context/context";
import { useShallow } from 'zustand/react/shallow'

import "react-datepicker/dist/react-datepicker.css";

const VariablesControlMenu = () => {
  const [selectedVariable, setSelectedVariable] = useState("");
  const [selectedVariableName, setSelectedVariableName] = useState("Select Variable");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [timeSupport, setTimeSupport] = useState(60);
  const [timeUnitName, setTimeUnitName] = useState("days");
  const toggleTimeSeriesPanelVisibility = useLayoutStore((state) => state.toggleTimeSeriesPanelVisibility);
  const currentDatastreams = useDataStore(useShallow((state) => state.current_datastreams));
  const current_site = useDataStore((state) => state.getCurrentSite());
  const { showLoadingToast } = useToastStore();
  const { backend } = useContext(AppContext);

  useEffect(() => {
    if (currentDatastreams.length > 0) {
      const firstItem = currentDatastreams[0];
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
  }, [currentDatastreams]);

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
    showLoadingToast()
    backend.do(backend.actions.GET_VALUES,{
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
    const label = `${item.variableName}${item.dataType ? ` - ${item.dataType}` : ""}`;
    setSelectedVariableName(label);
  };

  return (
    <Container style={{ display: "flex", justifyContent: "center" }}>
      <Row className="align-items-center">
        <Col md="auto">
          <FaChevronDown  
              size={24} 
              style={{ cursor: 'pointer', marginRight: '10px' }} 
              onClick={toggleTimeSeriesPanelVisibility} 
          />
        </Col>
        <Col md="auto">
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-center">
              <Col md="auto">
                  <Dropdown drop="up">
                      <Dropdown.Toggle 
                        variant='light' 
                        id="dropdown-basic"
                        size="sm"
                      >
                        {selectedVariableName}
                      </Dropdown.Toggle>
                      <Dropdown.Menu  style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {currentDatastreams.map((item, index) => {
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
              </Col>
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
                    className="form-control form-control-sm"
                    popperPlacement="top-end"
                    withPortal
                    
                  />
                </div>
              </Col>
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
                    className="form-control form-control-sm"
                    popperPlacement="top-end"
                    withPortal
                  />
                </div>
              </Col>
              <Col md="auto">
                <Button variant="primary" size="sm" type="submit">
                  <FaChartArea />
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>

    
  );
};

export default VariablesControlMenu;
