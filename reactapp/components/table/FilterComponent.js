// FilterComponent.js
import React from 'react';
import styled from 'styled-components';
import { MdClear } from 'react-icons/md';

const FilterWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const TextField = styled.input`
  height: 32px;
  flex: 1; /* Grow to fill available space */
  border-radius: 3px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #e5e5e5;
  padding: 0 32px 0 16px;
  background-color: #e5e5e5;
  color: #202124;

  &:hover {
    cursor: pointer;
  }
`;

const ClearButton = styled.button`
  height: 32px;
  width: 32px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #202124;
  color: #fff;
  border: none;
  cursor: pointer;
`;

const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <FilterWrapper>
    <TextField
      id="search"
      type="text"
      placeholder="Search"
      aria-label="Search Input"
      value={filterText}
      onChange={onFilter}
    />
    <ClearButton type="button" onClick={onClear}>
      <MdClear size={20} />
    </ClearButton>
  </FilterWrapper>
);

export default FilterComponent;
