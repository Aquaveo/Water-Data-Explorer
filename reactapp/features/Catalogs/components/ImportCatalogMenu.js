// ImportCatalogMenu.js
import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Alert,Spinner } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import ViewTable from 'features/Views/components/ViewTable';
import { MdClear } from "react-icons/md";
import styled from 'styled-components';
import useTagInput from 'components/tags/useTag';
import { TagField } from 'components/tags/tagField';
import useCatalogStore from '../hooks/useCatalogStore';
import LoadingServices from './LoadingServices';
import { toast } from "react-toastify";


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
  const { tags, handleAddTag, handleRemoveTag, cleanTags } = useTagInput(MAX_TAGS); // pass the maximum tags
  const { addCatalog, addSites } = useCatalogStore();
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  // New state to track selected views
  const [selectedViews, setSelectedViews] = useState([]);

  // Handler for row selection changes
  const handleSelectedRows = (state) => {
    setSelectedViews(state.selectedRows);
  };

  const importCatalog = (catalog) => {
    addCatalog(catalog);
    for (let i = 0; i < catalog.services.length; i++) {
      backend.do(backend.actions.IMPORT_VIEW, { catalog_id: catalog.id, ...catalog.services[i] });
    }
  }

  const importSites = (view) => {
    console.log('Importing sites for view:', view);
    backend.do(backend.actions.IMPORT_SITES, {view_id:view.id, url: view.url, catalog_id:view.catalog_id, sitecount: view.sitecount  } );
  };
  const saveSites = (data) => {
    console.log('Saving sites:', sites);
    addSites({catalogID: data.catalog_id, viewID: data.view_id, sites: data.sites });
  }; 

  useEffect(() => {
    backend.on(backend.actions.GET_LIST_SERVICES, setServices);
    backend.on(backend.actions.IMPORT_CATALOG, importCatalog);
    backend.on(backend.actions.IMPORT_VIEW,importSites);
    backend.on(backend.actions.IMPORT_SITES,saveSites);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_LIST_SERVICES);
      backend.off(backend.actions.IMPORT_CATALOG);
      backend.off(backend.actions.IMPORT_VIEW);
      backend.off(backend.actions.IMPORT_SITES);
    };
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      setIsServicesLoading(false);
    }
  }, [services]);


  const handleEndpointChange = (e) => {
    setIsServicesLoading(true);
    const value = e.target.value;
    backend.do(backend.actions.GET_LIST_SERVICES, { endpoint: value });
    setEndpoint(value);
  };

  const handleImport = () => {
    console.log('Importing catalog:', { name, endpoint, tags, selectedViews });
    if (!endpointError && endpoint.trim()) {
      // Send only selected views
      backend.do(backend.actions.IMPORT_CATALOG, { name, endpoint, tags, services: selectedViews });
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
        disabled={!endpoint.trim() || !name.trim() || selectedViews.length === 0}
      >
        Import
      </Button>
    </>
  );
};

export default ImportCatalogMenu;
