import styled from 'styled-components';


export const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f9f9f9'};
`;


