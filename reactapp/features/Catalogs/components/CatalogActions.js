import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { BsPlusCircle , BsDashCircle, BsFilterCircle   } from "react-icons/bs";

import styled from 'styled-components';


const StyledButton = styled(Button)`
  
//   border: none;
  color: white;
//   padding: 5px 6px;

//   &:hover, &:focus {
//     background-color: rgba(0, 0, 0, 0.1)!important;
//     color: white;
//     border: none;
//     box-shadow: none;
//   }
`;


const CatalogActions = ({ onAdd, onDelete, onFilter }) => {
  return (
    <ButtonGroup className="mb-3">
      <StyledButton variant="primary" onClick={onAdd}>
        <BsPlusCircle size="1.5rem" />
     </StyledButton>
      <StyledButton variant="danger" onClick={onDelete}>
        <BsDashCircle size="1.5rem" />
      </StyledButton>
      <StyledButton variant="secondary" onClick={onFilter}>
        <BsFilterCircle size="1.5rem"/>
      </StyledButton>
    </ButtonGroup>
  );
};

export default CatalogActions;