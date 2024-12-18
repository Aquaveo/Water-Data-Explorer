import Accordion from 'react-bootstrap/Accordion';
import {TableComponent} from './Table';
function CatalogList() {
  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Imported Catalogs</Accordion.Header>
        <Accordion.Body>
          <TableComponent />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Custom Catalogs</Accordion.Header>
        <Accordion.Body>
        <TableComponent />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Sites</Accordion.Header>
        <Accordion.Body>
        <TableComponent />
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default CatalogList;