import styled from "styled-components";
import { Form } from "react-bootstrap";

// Wrap the entire form in a flex container
export const HorizontalFormContainer = styled(Form)`
  display: flex;
  flex-wrap: wrap;   /* Allows wrapping on smaller screens */
  align-items: center;
  gap: 1rem;         /* Space between each item (variable dropdown, datepickers, etc.) */
`;

// Styled form group to keep label + input together inline
export const InlineFormGroup = styled(Form.Group)`
  margin-bottom: 0 !important;
  display: flex;
  flex-direction: column;
  
  label {
    margin-bottom: 0.25rem; /* Slight space below the label */
  }
`;

// Optional wrapper for DatePicker to control sizing
export const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: auto; /* so it doesn't take full width */
  }
  .react-datepicker__input-container {
    display: inline-block; /* keep input inline */
  }
`;