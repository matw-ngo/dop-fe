/**
 * Form Generation Library - Memoized Field Components
 *
 * All field components are memoized here to prevent unnecessary re-renders.
 * Import memoized versions from this file rather than directly from individual components.
 */

import { memo } from "react";
import { TextField } from "./TextField";
import { TextAreaField } from "./TextAreaField";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";
import { CheckboxField } from "./CheckboxField";
import { RadioField } from "./RadioField";
import { DateField } from "./DateField";
import { SwitchField } from "./SwitchField";
import { FileField } from "./FileField";

// Memoize all field components to prevent unnecessary re-renders
export const MemoizedTextField = memo(TextField);
export const MemoizedTextAreaField = memo(TextAreaField);
export const MemoizedNumberField = memo(NumberField);
export const MemoizedSelectField = memo(SelectField);
export const MemoizedCheckboxField = memo(CheckboxField);
export const MemoizedRadioField = memo(RadioField);
export const MemoizedDateField = memo(DateField);
export const MemoizedSwitchField = memo(SwitchField);
export const MemoizedFileField = memo(FileField);

// Also export non-memoized versions for direct use if needed
export {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  CheckboxField,
  RadioField,
  DateField,
  SwitchField,
  FileField,
};
