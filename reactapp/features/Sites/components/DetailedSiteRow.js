import React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { GrMap, GrCode ,GrCloudDownload,GrHelpBook } from "react-icons/gr";


const DetailedSiteRowContainer = styled.div`
  padding: 10px;
  background: #f9f9f9;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: center;
    border-bottom: 1px solid #ddd;
    padding: 5px;
  }

  td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }
`;

export const DetailedSiteRow = React.memo(({ data }) => {
  if (!data) return null;

  const { code, description, latitude, longitude, service_url } = data;

  return (
    <DetailedSiteRowContainer>
      <StyledTable>

        <tbody>
          {/* Code */}
          <tr>
            <td><GrCode size={20} style={{ marginRight: "6px" }} /> Code</td>
            <td>{code || "N/A"}</td>
          </tr>
          {/* Description */}
          <tr>
            <td><GrHelpBook size={20} style={{ marginRight: "6px" }} /> Description</td>
            <td>{description || "N/A"}</td>
          </tr>
          {/* Latitude/Longitude (combined) */}
          <tr>
            <td><GrMap size={20} style={{ marginRight: "6px" }} /> Coordinates </td>
            <td>
              
              {latitude != null && longitude != null
                ? `${latitude}, ${longitude}`
                : "N/A"}
            </td>
          </tr>
          {/* Service URL with a "Visit" button */}
          <tr>
            <td><GrCloudDownload size={20} style={{ marginRight: "6px" }} /> Service </td>
            <td>
              {service_url ? (
                <Button
                  variant="outline-primary"
                  size="sm"
                  href={`${service_url}?wsdl`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit
                </Button>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
        </tbody>
      </StyledTable>
    </DetailedSiteRowContainer>
  );
});
