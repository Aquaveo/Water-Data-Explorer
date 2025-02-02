// ImportSites.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import ViewTable from 'features/Cuahsi/components/tables/ViewTable';
import { MdClear } from "react-icons/md";
import styled from 'styled-components';
import useTagInput from 'components/tags/useTag';
import { TagField } from 'components/tags/tagField';
import useDataStore from '../../../Sites/hooks/useDataStore';
import LoadingItems from 'components/LoadingItems';
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'react-toastify'; // Import toast library
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

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
  // const [endpoint, setEndpoint] = useState('');
  const [services, setServices] = useState([]);
  const [uploadedSites, setUploadedSites] = useState(0);
  const [endpointError, setEndpointError] = useState('');
  const { tags, handleAddTag, handleRemoveTag, cleanTags } = useTagInput(MAX_TAGS);
  const addSites = useDataStore(useShallow((state) => state.addSites));
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [selectedViews, setSelectedViews] = useState([]);
  const endpoint = useRef('');

  const totalSitesRef = useRef(0);
  const toastIdRef = useRef(null);

  const handleSelectedRows = (state) => {
    setSelectedViews(state.selectedRows);
  };
  

  const handleImportSitesFromCatalog = (data) => {
    console.log('Imported sites:', data);
    addSites(data.sites);

    setUploadedSites((prevUploadedSites) => {
      const newUploadedCount = prevUploadedSites + data.sites.length;
      // Update the toast with progress
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          render: `Uploading sites ${newUploadedCount}/${totalSitesRef.current}`,
          type: "info",
          isLoading: true,
        });
      }

      // Check if the upload is complete
      if (newUploadedCount >= totalSitesRef.current) {
        toast.update(toastIdRef.current, {
          render: `Upload complete: ${totalSitesRef.current} sites uploaded`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        toastIdRef.current = null; // Clear the toast ID
      }

      return newUploadedCount; // Update the state
    });
  };
  
  const handleGetServices = (data) =>{
    console.log('Services:', data);
    if (data.error) {
      setEndpointError(data.error);
      
    }
    else if(data.info=="The endpoint is a service"){
      setEndpointError('');
      setServices([]);
      const singleService = {
        servURL: endpoint.current,
        sitecount: 0,
        title: '',
        variablecount: 0,
        valuecount: 0,
      };
      console.log('Single Service:', singleService);
      
      setSelectedViews(prev => [...prev, singleService]);

      console.log('The endpoint is a service');
    }
    else{
      setEndpointError('');
      setServices(data);
    }
    setIsServicesLoading(false);

  }


  useEffect(() => {
    backend.on(backend.actions.GET_LIST_SERVICES, handleGetServices);
    backend.on(backend.actions.GET_IMPORTED_CUAHSI_SITES, handleImportSitesFromCatalog);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_LIST_SERVICES);
      backend.off(backend.actions.GET_IMPORTED_CUAHSI_SITES);
    };
  }, []);

  const handleEndpointChange = (e) => {
    setIsServicesLoading(true);
    const value = e.target.value;
    backend.do(backend.actions.GET_LIST_SERVICES, { endpoint: value });
    endpoint.current = value;
    // setEndpoint(value);
  };

  const handleImport = () => {
    console.log('Importing Sites from catalog:', {tags, selectedViews });
    const totalSiteCount = selectedViews.reduce((acc, view) => acc + (view.sitecount || 0), 0);
    totalSitesRef.current = totalSiteCount; // Set the totalSites in ref
    setUploadedSites(0); // Reset uploadedSites
    if (!endpointError && endpoint.current.trim()) {
      const id = toast.loading(`Uploading sites 0/${totalSiteCount}`);
      toastIdRef.current = id; // Set the toastId in ref
      backend.do(backend.actions.IMPORT_SITES_FROM_CATALOG, {tags, services: selectedViews });
    }
  };

  const handleClear = () => {
    if (endpoint || tags) {
      endpoint.current = '';
      // setEndpoint('');
      cleanTags();
      setServices([]);
      setSelectedViews([]);
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
              type="text"
              placeholder="Enter endpoint URL"
              aria-label="Search Input"
              value={endpoint.current}
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
          <LoadingItems />
          ) : null
        }

      {services && services.length > 0 && (
        <ViewTable 
          data={services} 
          onSelectedRowsChange={handleSelectedRows} // Pass the handler
        />
      )}

      {/* Import button below the table */}
      <Button 
        variant="primary" 
        onClick={handleImport} 
        disabled={!endpoint.current.trim() || selectedViews.length === 0}
      >
        Import Sites
      </Button>
    </>
  );
};

export default ImportSitesFromCatalogMenu;
// https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(aral-sea-basin))/cuahsi_1_1.asmx