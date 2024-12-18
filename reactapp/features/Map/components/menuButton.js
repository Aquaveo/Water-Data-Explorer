import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa";
import styled from 'styled-components';

const AddMenuButtonContainer = styled.div`
  position: absolute; 
  bottom: 100px; 
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 4px;

`;

const NoCaretToggle = styled(Dropdown.Toggle)`
  &::after {
    display: none !important;
  }
`;

const AddMenuButton = () => {
  return (
    <AddMenuButtonContainer>
      <Dropdown drop="end" autoClose="outside">
        <NoCaretToggle variant="dark" id="dropdown-basic">
          <FaPlus />
        </NoCaretToggle>

        <Dropdown.Menu>
          {/* Catalogs Nested Dropdown */}
          <Dropdown drop="end" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100">
              New Catalog
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#import">Import Catalog</Dropdown.Item>
              <Dropdown.Item href="#add-custom-catalog">Add Custom Catalog</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown.Divider />

          {/* Servers Nested Dropdown */}
          <Dropdown drop="end" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100">
              New Server
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#add-server-to-catalog">Add Server to Custom Catalog</Dropdown.Item>
              <Dropdown.Item href="#add-custom-server">Add Custom Server</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown.Divider />

          {/* Sites Nested Dropdown */}
          <Dropdown drop="end" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100">
              New Sites
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#add-sites">Add Sites</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Dropdown.Menu>
      </Dropdown>
    </AddMenuButtonContainer>
  );
};

export default AddMenuButton;
