/**
 * Form Generation Library - Memoized Field Components
 *
 * All field components are memoized here to prevent unnecessary re-renders.
 * Import memoized versions from this file rather than directly from individual components.
 */

import { memo } from "react";
import { CheckboxField } from "./CheckboxField";
import { DateField } from "./DateField";
import { EkycField } from "./EkycField";
import { FileField } from "./FileField";
import { NumberField } from "./NumberField";
import { RadioField } from "./RadioField";
import { SelectField } from "./SelectField";
import { SwitchField } from "./SwitchField";
import { TextAreaField } from "./TextAreaField";
import { TextField } from "./TextField";

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
export const MemoizedEkycField = memo(EkycField);

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
  EkycField,
};
