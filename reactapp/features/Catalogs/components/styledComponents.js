// containers.js
import styled from 'styled-components';
import Offcanvas from 'react-bootstrap/Offcanvas';


export const StyledOffcanvas = styled(Offcanvas)`
  margin-top: var(--ts-header-height);
  width: 600px !important; 

  /* If you need to ensure that the offcanvas content respects this width, you can also force it: */
  .offcanvas-body {
    max-width: 100%;
  }
`;
