import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
function ComponentsList() {
  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Catalogs</Accordion.Header>
        <Accordion.Body>
          <CatalogTable />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Views</Accordion.Header>
        <Accordion.Body>
        <CatalogTable />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Sites</Accordion.Header>
        <Accordion.Body>
        <CatalogTable />
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default ComponentsList;