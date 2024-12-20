import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";
import ViewTable from 'features/Views/components/ViewTable';

const ImportCatalogMenu = () => {
  const { backend } = useContext(AppContext);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState([]);

  const handleImport = () => {
    console.log('Importing catalog with:', { name, endpoint, description, services });
    
    // Implement any further logic here.
  };

  const handleEndpointKeyUp = (e) => {
    // Called every time a key is released in the endpoint field.
    // You can add custom logic here, e.g.:
    console.log('User finished typing endpoint:', e.target.value);
    if (e.target.value.length > 0) return
    backend.do(backend.actions.GET_LIST_SERVICES, { "endpoint": endpoint });
    // Potentially trigger something else after user stops typing.
  };

  useEffect(() => {
    backend.on(backend.actions.GET_LIST_SERVICES, (data) => {
      setServices(data);
    });
  }, [backend]);

  useEffect(() => {
    console.log(services);
  }, [services]);

  return (
    <>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text"
            placeholder="Enter catalog name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Endpoint</Form.Label>
          <Form.Control 
            type="text"
            placeholder="Enter endpoint URL"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            onKeyUp={handleEndpointKeyUp} // trigger event on keyup
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags</Form.Label>
          <Form.Control 
            as="textarea"
            rows={2}
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
      </Form>

      {/* Show ViewTable if services is available and has data */}
      {services && services.length > 0 && (
        <ViewTable data={services} />
      )}

      {/* Move Query Services button below the table */}
      <Button variant="primary" onClick={handleImport}>Query Services</Button>
    </>
  );
};

export default ImportCatalogMenu;
