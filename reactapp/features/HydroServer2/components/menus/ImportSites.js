// ImportSitesFromHydroServer2Menu.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import SiteTable from 'features/Sites/components/SiteTable';
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


const ImportSitesFromHydroServer2Menu = () => {
  const { backend } = useContext(AppContext);
  const [endpoint, setEndpoint] = useState('');
  const [stations, setStations] = useState([]);
  const [uploadedSites, setUploadedSites] = useState(0);
  const [endpointError, setEndpointError] = useState('');
  const { tags, handleAddTag, handleRemoveTag, cleanTags } = useTagInput(MAX_TAGS);
  const addSites = useDataStore(useShallow((state) => state.addSites));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStations, setSelectedStations] = useState([]);
  const totalSitesRef = useRef(0);
  const toastIdRef = useRef(null);

  const handleSelectedRows = (state) => {
    setSelectedStations(state.selectedRows);
  };
  

  const handleImportSites = (data) => {
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
  
  const handleGetStations = (data) =>{
    setIsLoading(false);
    setStations(data);
  }


  useEffect(() => {
    backend.on(backend.actions.GET_LIST_HYDOSERVER_STATIONS, handleGetStations);
    backend.on(backend.actions.GET_IMPORTED_HYDOSERVER_SITES, handleImportSites);
    // Cleanup on unmount
    return () => {
      backend.off(backend.actions.GET_LIST_HYDOSERVER_STATIONS);
      backend.off(backend.actions.GET_IMPORTED_HYDOSERVER_SITES);
    };
  }, []);

  const handleEndpointChange = (e) => {
    setIsLoading(true);
    const value = e.target.value;
    backend.do(backend.actions.GET_LIST_HYDOSERVER_STATIONS, { endpoint: value });
    setEndpoint(value);
  };

  const handleImport = () => {
    console.log('Importing Sites:', {tags, selectedStations });
    const totalSiteCount = selectedStations.reduce((acc, view) => acc + (view.sitecount || 0), 0);
    totalSitesRef.current = totalSiteCount; // Set the totalSites in ref
    setUploadedSites(0); // Reset uploadedSites
    if (!endpointError && endpoint.trim()) {
      const id = toast.loading(`Uploading sites 0/${totalSiteCount}`);
      toastIdRef.current = id; // Set the toastId in ref
      backend.do(backend.actions.IMPORT_SITES_FROM_HYDROSERVER2, {tags, stations: selectedStations });
    }
  };

  const handleClear = () => {
    if (endpoint || name || tags) {
      setName('');
      setEndpoint('');
      cleanTags();
      setStations([]);
      setSelectedStations([]); // Clear selected views
      setEndpointError('');
    }
  };

  return (
    <>
      <Form>

        <Form.Group className="mb-3" controlId="endpoint">
          <Form.Label>Endpoint</Form.Label>
          <FilterWrapper>
            <Form.Control
              type="text"
              placeholder="Enter HydroServer 2 URL"
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

        <Form.Group className="mb-3" controlId="tags">
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
         isLoading ? (
          <LoadingItems />
          ) : null
        }

      {stations && stations.length > 0 && (
        <SiteTable 
          data={stations} 
          onSelectedRowsChange={handleSelectedRows}
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
        disabled={!endpoint.trim() || selectedStations.length === 0}
      >
        Import Sites
      </Button>
    </>
  );
};

export default ImportSitesFromHydroServer2Menu;
