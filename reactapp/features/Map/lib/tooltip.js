import styled from "styled-components";


export const Tooltip = styled.div`
  position: relative;
  margin: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  max-width: 300px;
  font-size: 12px;
  z-index: 9;
  pointer-events: none;
  border-radius: 4px;
  left: ${(props) => props.left || '0px'};
  top: ${(props) => props.top || '0px'};
`;