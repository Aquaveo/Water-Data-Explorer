
import Spinner from 'react-bootstrap/Spinner';
import styled from 'styled-components';

const CenteredDiv = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

function LoadingServices() {
    return (
        
        <CenteredDiv>
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
        </CenteredDiv>
    );
}


export default LoadingServices;