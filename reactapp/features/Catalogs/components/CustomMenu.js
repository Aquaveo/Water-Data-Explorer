import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaEllipsisV, FaTrash,FaInfo,FaWater } from 'react-icons/fa';
import { WiRaindrops } from "react-icons/wi";

const CustomMenu = ({ row, onDeleteRow, size }) => {
  const deleteRow = () => {
    if (onDeleteRow) {
      onDeleteRow(row);
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" size={size} className="p-0">
        <FaEllipsisV />
      </Dropdown.Toggle>

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