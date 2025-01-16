import React from "react";
import styled from "styled-components";
import { Badge, Button } from "react-bootstrap";

const DetailedSiteRowContainer = styled.div`
  padding: 10px;
  background: #f9f9f9;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: center; /* Center-align the table headers */
    border-bottom: 1px solid #ddd;
    padding: 5px;
  }

  td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }
`;

const badgeVariants = ["primary", "secondary", "info", "warning", "danger"]; // Bootstrap badge variants

export const DetailedSiteRow = React.memo(({ data }) => {
  if (!data) return null;

  return (
    <DetailedSiteRowContainer>
      <StyledTable>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key.replace("_", " ")}</td>
              <td>
                {key === "tags" && Array.isArray(value) ? (
                  value.map((tag, index) => (
                    <Badge
                      key={index}
                      bg={badgeVariants[index % badgeVariants.length]} // Bootstrap badge variant
                      className="me-1"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : key === "service_url" ? (
                  <Button
                    variant="outline-primary"
                    href={`${value}?wsdl`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit
                  </Button>
                ) : (
                  Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </DetailedSiteRowContainer>
  );
});
