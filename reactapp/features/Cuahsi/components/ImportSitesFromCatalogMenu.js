// ImportCatalogMenu.js
import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import ViewTable from 'features/Cuahsi/components/ViewTable';
import { MdClear } from "react-icons/md";
import styled from 'styled-components';
import useTagInput from 'components/tags/useTag';
import { TagField } from 'components/tags/tagField';
import useDataStore from '../../Sites/hooks/useDataStore';
import LoadingServices from './LoadingServices';
import { useShallow } from 'zustand/react/shallow'

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


const ImportSitesFromCatalogMenu = () => {
  const { backend } = useContext(AppContext);
  const [endpoint, setEndpoint] = useState('');
  const [services, setServices] = useState([]);
  const [endpointError, setEndpointError] = useState('');
  const { tags, handleAddTag, handleRemoveTag, cleanTags } = useTagInput(MAX_TAGS); // pass the maximum tags
  const addSites = useDataStore(useShallow((state) => state.addSites));
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [selectedViews, setSelectedViews] = useState([]);



  const handleSelectedRows = (state) => {
    setSelectedViews(state.selectedRows);
  };
  

  const handleImportSitesFromCatalog = (data) => {
    console.log('Imported sites:', data);
    addSites(data.sites);
  };
  
  const handleGetServices = (data) =>{
    setIsServicesLoading(false);
    setServices(data);
  }


  useEffect(() => {
    backend.on(backend.actions.GET_LIST_SERVICES, handleGetServices);
    backend.on(backend.actions.GET_IMPORTED_CUAHSI_SITES, handleImportSitesFromCatalog);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_LIST_SERVICES);
      backend.off(backend.actions.IMPORT_SITES_FROM_CATALOG);
    };
  }, []);

  const handleEndpointChange = (e) => {
    setIsServicesLoading(true);
    const value = e.target.value;
    backend.do(backend.actions.GET_LIST_SERVICES, { endpoint: value });
    setEndpoint(value);
  };

  const handleImport = () => {
    console.log('Importing Sites from catalog:', {tags, selectedViews });
    if (!endpointError && endpoint.trim()) {
      backend.do(backend.actions.IMPORT_SITES_FROM_CATALOG, {tags, services: selectedViews });
    }
  };

  const handleClear = () => {
    if (endpoint || name || tags) {
      setName('');
      setEndpoint('');
      cleanTags();
      setServices([]);
      setSelectedViews([]); // Clear selected views
      setEndpointError('');
    }
  };

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

        <Form.Group className="mb-3" controlId="catalogDescription">
          <Form.Label>Tags</Form.Label>
            <TagField
              tags={tags}
              addTag={handleAddTag}
              removeTag={handleRemoveTag}
              maxTags={MAX_TAGS}
            />
        </Form.Group>
      </Form>
        {
         isServicesLoading ? (
          <LoadingServices />
          ) : null
        }

      {services && services.length > 0 && (
        <ViewTable 
          data={services} 
          onSelectedRowsChange={handleSelectedRows} // Pass the handler
        />
      )}

      {/* Show error alert if there's an endpoint error */}
      {endpointError && (
        <Alert variant="danger">
          {endpointError}
        </Alert>
      )}

      {/* Import button below the table */}
      <Button 
        variant="primary" 
        onClick={handleImport} 
        disabled={!endpoint.trim() || selectedViews.length === 0}
      >
        Import Sites
      </Button>
    </>
  );
};

export default ImportSitesFromCatalogMenu;
