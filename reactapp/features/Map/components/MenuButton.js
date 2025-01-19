import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa";
import { TbBrandDatabricks, TbSitemap } from "react-icons/tb";
import styled from 'styled-components';
import useLayoutStore from 'stores/useLayoutStore';

const AddMenuButtonContainer = styled.div`
  position: absolute; 
  top: 100px; 
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

const IconWithText = styled.span`
  display: flex;
  align-items: center;
  gap: 8px; /* Space between the icon and text */
`;

const AddMenuButton = () => {
  const { showImportCatalogMenu } = useLayoutStore();

  return (
    <AddMenuButtonContainer>
      <Dropdown drop="end" autoClose="outside">
        <NoCaretToggle variant="dark" id="dropdown-basic">
          <FaPlus />
        </NoCaretToggle>

        <Dropdown.Menu>
          {/* Catalogs Nested Dropdown */}
          <Dropdown drop="start" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100 d-flex align-items-center">
              <IconWithText>
                <TbSitemap size={20}/>
                <span>Cuahsi</span>
              </IconWithText>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Button} onClick={showImportCatalogMenu}>Import from Catalog</Dropdown.Item>
              <Dropdown.Item as={Button}>Import from Service</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown.Divider />

          {/* Servers Nested Dropdown */}
          <Dropdown drop="start" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100 d-flex align-items-center">
              <IconWithText>
                <TbBrandDatabricks size={20}/>
                <span>HydroServer 2</span>
              </IconWithText>
            </Dropdown.Toggle>
          </Dropdown>

          <Dropdown.Divider />

          {/* Sites Nested Dropdown */}
          <Dropdown drop="start" autoClose="outside">
            <Dropdown.Toggle as={Dropdown.Item} className="w-100 d-flex align-items-center">
              <IconWithText>
                <TbBrandDatabricks size={20} />
                <span>Wis2Box</span>
              </IconWithText>
            </Dropdown.Toggle>
          </Dropdown>
        </Dropdown.Menu>
      </Dropdown>
    </AddMenuButtonContainer>
  );
};

export default AddMenuButton;
