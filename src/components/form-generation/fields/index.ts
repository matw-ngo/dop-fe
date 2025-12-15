/**
 * Form Generation Library - Optimized Field Components
 *
 * Memoized versions of field components to prevent unnecessary re-renders
 */

import { memo } from "react";
import { TextField as TextFieldBase } from "./TextField";
import { NumberField as NumberFieldBase } from "./NumberField";
import { SelectField as SelectFieldBase } from "./SelectField";
import { CheckboxField as CheckboxFieldBase } from "./CheckboxField";
import { RadioField as RadioFieldBase } from "./RadioField";
import { DateField as DateFieldBase } from "./DateField";
import { SwitchField as SwitchFieldBase } from "./SwitchField";
import { FileField as FileFieldBase } from "./FileField";

/**
 * Memoized field components
 * These prevent re-renders when props haven't changed
 */

export const TextField = memo(TextFieldBase);
TextField.displayName = "TextField";

export const NumberField = memo(NumberFieldBase);
NumberField.displayName = "NumberField";

export const SelectField = memo(SelectFieldBase);
SelectField.displayName = "SelectField";

export const CheckboxField = memo(CheckboxFieldBase);
CheckboxField.displayName = "CheckboxField";

export const RadioField = memo(RadioFieldBase);
RadioField.displayName = "RadioField";

export const DateField = memo(DateFieldBase);
DateField.displayName = "DateField";

export const SwitchField = memo(SwitchFieldBase);
SwitchField.displayName = "SwitchField";

export const FileField = memo(FileFieldBase);
FileField.displayName = "FileField";
