// ImportCatalogMenu.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import ViewTable from 'features/Views/components/ViewTable';
import { MdClear } from "react-icons/md";
import styled from 'styled-components';
import useTagInput from 'components/tags/useTag';
import { TagField } from 'components/tags/tagField';

const ClearButton = styled.button`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  height: 34px;
  width: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #202124;
  color: #fff;
  border: none;
  cursor: pointer;
  margin-left: -1px;

  &:hover {
    background-color: #333333;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  max-width: 100%;
`;
const MAX_TAGS = 5;
const ImportCatalogMenu = () => {
  const { backend } = useContext(AppContext);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [services, setServices] = useState([]);
  const [endpointError, setEndpointError] = useState('');
  const { tags, handleAddTag, handleRemoveTag } = useTagInput(MAX_TAGS); // pass the maximum tags

  // Ref to store the timeout ID for debouncing
  const debounceTimeoutRef = useRef(null);

  // Validation Function
  const isValidEndpoint = (value) => {
    const trimmedValue = value.trim();
    const endsWithHisCentral = trimmedValue.endsWith('hiscentral.asmx');
    const startsWithProtocol = /^https?:\/\//i.test(trimmedValue);
    return endsWithHisCentral && startsWithProtocol;
  };

  // Effect to handle debounced validation
  useEffect(() => {
    // Clear the previous timeout if endpoint changes before timeout completes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout to validate after 500ms of no changes
    debounceTimeoutRef.current = setTimeout(() => {
      if (endpoint) {
        if (!isValidEndpoint(endpoint)) {
          setEndpointError('Endpoint must start with http:// or https:// or end with hiscentral.asmx');
        } else {
          setEndpointError('');
          handleImport();
        }
      } else {
        setEndpointError('');
        handleImport();

      }
    }, 500); // 500ms delay; adjust as needed

    // Cleanup function to clear the timeout if component unmounts or endpoint changes
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [endpoint]);

  const handleEndpointChange = (e) => {
    const value = e.target.value;
    setEndpoint(value);
    // Validation is handled by the useEffect above
  };

  const handleImport = () => {
    console.log('Importing catalog with:', { name, endpoint, tags, services });
    if (!endpointError && endpoint) {
      backend.do(backend.actions.GET_LIST_SERVICES, { "endpoint": endpoint });
      // Implement any further logic here.
    }
  };

  const handleClear = () => {
    if (endpoint || name || tags) {
      setName('');
      setEndpoint('');
      // setTags('');
      setServices([]);
      setEndpointError('');
    }
  };

  useEffect(() => {
    const handleServices = (data) => {
      setServices(data);
    };

    backend.on(backend.actions.GET_LIST_SERVICES, handleServices);

    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_LIST_SERVICES, handleServices);
    };
  }, [backend]);

  useEffect(() => {
    console.log('Services:', services);
  }, [services]);

  return (
    <>
      <Form>

      <Form.Group className="mb-3" controlId="catalogEndpoint">
          <Form.Label>Endpoint</Form.Label>
          <FilterWrapper>
            <Form.Control
              id="search"
              type="text"
              placeholder="Enter endpoint URL"
              aria-label="Search Input"
              value={endpoint}
              onChange={handleEndpointChange}
            />
            <ClearButton type="button" onClick={handleClear}>
              <MdClear size={20}/>
            </ClearButton>
          </FilterWrapper>
          {endpointError && <Form.Text className="text-danger">{endpointError}</Form.Text>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="catalogName">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter catalog name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </Form.Group>


        <Form.Group className="mb-3" controlId="catalogDescription">
          <Form.Label>Tags</Form.Label>

            <TagField
              tags={tags}
              addTag={handleAddTag}
              removeTag={handleRemoveTag}
              maxTags={MAX_TAGS}
            />
          {/* <Form.Control 
            as="textarea" 
            rows={2}
            placeholder="Enter tags" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
          /> */}
        </Form.Group>
      </Form>

      {/* Show ViewTable if services is available and has data */}
      {services && services.length > 0 && (
        <ViewTable data={services} />
      )}

      {/* Show error alert if there's an endpoint error */}
      {endpointError && (
        <Alert variant="danger">
          {endpointError}
        </Alert>
      )}

      {/* Query Services button below the table */}
      <Button 
        variant="primary" 
        onClick={handleImport} 
        disabled={!!endpointError || !endpoint.trim()}
      >
        Import
      </Button>
    </>
  );
};

export default ImportCatalogMenu;
