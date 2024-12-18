import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaEllipsisV, FaTrash,FaInfo,FaWater } from 'react-icons/fa';
import styled from 'styled-components';

const NoCaretToggle = styled(Dropdown.Toggle)`
  &::after {
    display: none !important;
  }
`;

const CustomMenu = ({ row, onDeleteRow, size }) => {
  const deleteRow = () => {
    if (onDeleteRow) {
      onDeleteRow(row);
    }
  };



  return (
    <Dropdown align="end">
      <NoCaretToggle variant="link" size={size} className="p-0">
        <FaEllipsisV />
      </NoCaretToggle>

      <Dropdown.Menu>
        <Dropdown.Item>
            <FaInfo style={{ marginRight: '8px' }} />
            Information
        </Dropdown.Item>
        <Dropdown.Item>
            <FaWater style={{ marginRight: '8px' }} />
            Variables
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={deleteRow}>
          <FaTrash style={{ marginRight: '8px' }} />
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CustomMenu;