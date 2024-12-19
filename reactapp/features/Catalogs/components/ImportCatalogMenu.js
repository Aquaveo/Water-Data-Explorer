import React, { useState, useContext,useEffect  } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AppContext } from "features/react-tethys/context/context";


const ImportCatalogMenu = () => {
  const { backend } = useContext(AppContext);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState('');

  const handleImport = () => {
    console.log('Importing catalog with:', { name, endpoint, description, services });
    // Implement the import logic here
  };


  useEffect(() => {
    console.log(backend)
    // if (show) {
    //   backend.do(backend.actions.WORKFLOW_DATA_ALL, {initial: true})
    // }
  }, []);

  return (
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
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={2}
          placeholder="Enter description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </Form.Group>

      <Button variant="primary" onClick={handleImport}>Import</Button>
    </Form>
  );
};

export default ImportCatalogMenu;
