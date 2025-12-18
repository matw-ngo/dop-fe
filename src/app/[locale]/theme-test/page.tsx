"use client";

import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";
import { expandTheme } from "@/components/form-generation/themes/theme-utils";
import { FormProvider } from "@/components/form-generation/context/FormContext";
import { TextField } from "@/components/form-generation/fields/TextField";
import { SelectField } from "@/components/form-generation/fields/SelectField";
import { TextAreaField } from "@/components/form-generation/fields/TextAreaField";
import { NumberField } from "@/components/form-generation/fields/NumberField";
import { CheckboxField } from "@/components/form-generation/fields/CheckboxField";
import { DateField } from "@/components/form-generation/fields/DateField";
import { RadioField } from "@/components/form-generation/fields/RadioField";
import { SwitchField } from "@/components/form-generation/fields/SwitchField";
import { FileField } from "@/components/form-generation/fields/FileField";
import { EkycField } from "@/components/form-generation/fields/EkycField";
import { FieldType } from "@/components/form-generation";
import type {
  TextFieldConfig,
  SelectFieldConfig,
  TextAreaFieldConfig,
  NumberFieldConfig,
  CheckboxFieldConfig,
  DateFieldConfig,
  RadioFieldConfig,
  FileFieldConfig,
  EkycFieldConfig,
  BaseFieldConfig,
} from "@/components/form-generation/types";
import { useState } from "react";

// Test data
const textFieldConfig: TextFieldConfig = {
  id: "test-input",
  name: "testInput",
  type: FieldType.TEXT,
  label: "Test Input",
  placeholder: "Enter some text...",
};

const selectFieldConfig: SelectFieldConfig = {
  id: "test-select",
  name: "testSelect",
  type: FieldType.SELECT,
  label: "Test Select",
  placeholder: "Choose an option...",
  options: {
    choices: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
  },
};

const textFieldWithAdornments: TextFieldConfig = {
  ...textFieldConfig,
  id: "input-with-adornments",
  options: {
    prefix: "$",
    suffix: "USD",
  },
};

// More field configurations
const textAreaFieldConfig: TextAreaFieldConfig = {
  id: "test-textarea",
  name: "testTextarea",
  type: FieldType.TEXTAREA,
  label: "Test Text Area",
  placeholder: "Enter multi-line text...",
  options: {
    rows: 4,
    maxLength: 500,
  },
};

const numberFieldConfig: NumberFieldConfig = {
  id: "test-number",
  name: "testNumber",
  type: FieldType.NUMBER,
  label: "Test Number",
  placeholder: "Enter a number...",
  options: {
    min: 0,
    max: 100,
    step: 0.01,
  },
};

const currencyFieldConfig: NumberFieldConfig = {
  ...numberFieldConfig,
  id: "test-currency",
  name: "testCurrency",
  type: FieldType.CURRENCY,
  label: "Test Currency",
  options: {
    currency: "VND",
    showSymbol: true,
  },
};

const checkboxFieldConfig: CheckboxFieldConfig = {
  id: "test-checkbox",
  name: "testCheckbox",
  type: FieldType.CHECKBOX,
  label: "I agree to the terms and conditions",
  options: {
    checkboxLabel: "I agree to the terms and conditions",
  },
};

const checkboxGroupConfig: CheckboxFieldConfig = {
  id: "test-checkbox-group",
  name: "testCheckboxGroup",
  type: FieldType.CHECKBOX_GROUP,
  label: "Select your interests",
  options: {
    choices: [
      { value: "tech", label: "Technology" },
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
    ],
  },
};

const dateFieldConfig: DateFieldConfig = {
  id: "test-date",
  name: "testDate",
  type: FieldType.DATE,
  label: "Test Date",
  placeholder: "Select a date...",
  options: {
    format: "MM/dd/yyyy",
  },
};

const radioFieldConfig: RadioFieldConfig = {
  id: "test-radio",
  name: "testRadio",
  type: FieldType.RADIO,
  label: "Select an option",
  options: {
    choices: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
    layout: "vertical",
  },
};

const switchFieldConfig = {
  id: "test-switch",
  name: "testSwitch",
  type: FieldType.SWITCH,
  label: "Enable notifications",
} as BaseFieldConfig;

const fileFieldConfig: FileFieldConfig = {
  id: "test-file",
  name: "testFile",
  type: FieldType.FILE,
  label: "Upload File",
  options: {
    accept: ".pdf,.doc,.docx,.jpg,.png",
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  },
};

const multiFileFieldConfig: FileFieldConfig = {
  ...fileFieldConfig,
  id: "test-multi-file",
  name: "testMultiFile",
  label: "Upload Multiple Files",
  options: {
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: true,
    showPreview: true,
  },
};

const ekycFieldConfig: EkycFieldConfig = {
  id: "test-ekyc",
  name: "testEkyc",
  type: FieldType.EKYC,
  label: "Identity Verification",
  renderMode: "button",
  verification: {
    provider: "vnpt",
    confidenceThreshold: 70,
    showResultPreview: true,
    autofillMapping: {
      fullName: "fullName",
      idNumber: "idCard.number",
    },
    uiConfig: {
      maxRetries: 3,
      showProgress: true,
    },
  },
};

export default function ThemeTestPage() {
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [adornedValue, setAdornedValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [currencyValue, setCurrencyValue] = useState(0);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [checkboxGroupValue, setCheckboxGroupValue] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState<string | undefined>(undefined);
  const [radioValue, setRadioValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [multiFileValue, setMultiFileValue] = useState<File[] | null>(null);
  const [ekycValue, setEkycValue] = useState<any>(null);

  // Form data for FormProvider
  const [formData, setFormData] = useState({});

  const handleFieldChange = (value: string) => {
    console.log("Field changed:", value);
  };

  const handleFieldBlur = () => {
    console.log("Field blurred");
  };

  const handleCheckboxChange = (value: boolean | string[]) => {
    console.log("Checkbox changed:", value);
  };

  const handleFileChange = (value: File | File[] | null) => {
    console.log("File changed:", value);
  };

  const handleDateChange = (value: string | Date | undefined) => {
    console.log("Date changed:", value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Theme System Test
        </h1>

        {/* Original Legacy Theme */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Original Legacy Theme
          </h2>
          <FormThemeProvider theme={legacyLoanTheme}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextField (Original)
                </label>
                <TextField
                  field={textFieldConfig}
                  value={textValue}
                  onChange={setTextValue}
                  onBlur={handleFieldBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SelectField (Original)
                </label>
                <SelectField
                  field={selectFieldConfig}
                  value={selectValue}
                  onChange={setSelectValue}
                  onBlur={handleFieldBlur}
                />
              </div>
            </div>
          </FormThemeProvider>
        </section>

        {/* Simplified Legacy Theme */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Simplified Legacy Theme
          </h2>
          <FormThemeProvider theme={expandTheme(legacyLoanTheme)}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextField (Simplified)
                </label>
                <TextField
                  field={textFieldConfig}
                  value={textValue}
                  onChange={setTextValue}
                  onBlur={handleFieldBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SelectField (Simplified)
                </label>
                <SelectField
                  field={selectFieldConfig}
                  value={selectValue}
                  onChange={setSelectValue}
                  onBlur={handleFieldBlur}
                />
              </div>
            </div>

            {/* Test with Adornments */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TextField with Adornments (Simplified)
              </label>
              <TextField
                field={textFieldWithAdornments}
                value={adornedValue}
                onChange={setAdornedValue}
                onBlur={handleFieldBlur}
              />
            </div>

            {/* Test Error State */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TextField with Error (Simplified)
              </label>
              <TextField
                field={textFieldConfig}
                value=""
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error="This field is required"
              />
            </div>

            {/* Test Disabled State */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disabled TextField (Simplified)
              </label>
              <TextField
                field={textFieldConfig}
                value="Disabled value"
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                disabled
              />
            </div>
          </FormThemeProvider>
        </section>

        {/* All Field Components Test */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            All Field Components (Simplified Theme)
          </h2>
          <FormThemeProvider theme={expandTheme(legacyLoanTheme)}>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextField
                </label>
                <TextField
                  field={textFieldConfig}
                  value={textValue}
                  onChange={setTextValue}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextAreaField
                </label>
                <TextAreaField
                  field={textAreaFieldConfig}
                  value={textAreaValue}
                  onChange={setTextAreaValue}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NumberField
                </label>
                <NumberField
                  field={numberFieldConfig}
                  value={numberValue}
                  onChange={(value) => {
                    console.log("Number changed:", value);
                    setNumberValue(value);
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CurrencyField (VND)
                </label>
                <NumberField
                  field={currencyFieldConfig}
                  value={currencyValue}
                  onChange={(value) => {
                    console.log("Currency changed:", value);
                    setCurrencyValue(value);
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SelectField
                </label>
                <SelectField
                  field={selectFieldConfig}
                  value={selectValue}
                  onChange={setSelectValue}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DateField
                </label>
                <DateField
                  field={dateFieldConfig}
                  value={dateValue}
                  onChange={(value) => {
                    console.log("Date changed:", value);
                    setDateValue(value as string);
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Checkbox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CheckboxField
                </label>
                <CheckboxField
                  field={checkboxFieldConfig}
                  value={checkboxValue}
                  onChange={(value) => {
                    console.log("Checkbox changed:", value);
                    if (typeof value === "boolean") {
                      setCheckboxValue(value);
                    }
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Checkbox Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CheckboxGroupField
                </label>
                <CheckboxField
                  field={checkboxGroupConfig}
                  value={checkboxGroupValue}
                  onChange={(value) => {
                    console.log("CheckboxGroup changed:", value);
                    if (Array.isArray(value)) {
                      setCheckboxGroupValue(value);
                    }
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Radio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RadioField
                </label>
                <RadioField
                  field={radioFieldConfig}
                  value={radioValue}
                  onChange={setRadioValue}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* Switch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SwitchField
                </label>
                <SwitchField
                  field={switchFieldConfig}
                  value={switchValue}
                  onChange={(value) => {
                    console.log("Switch changed:", value);
                    if (typeof value === "boolean") {
                      setSwitchValue(value);
                    }
                  }}
                  onBlur={handleFieldBlur}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FileField
                </label>
                <FileField
                  field={fileFieldConfig}
                  value={fileValue}
                  onChange={(value) => {
                    console.log("File changed:", value);
                    if (!Array.isArray(value)) {
                      setFileValue(value as File | null);
                    }
                  }}
                />
              </div>

              {/* Multiple File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MultiFileField with Preview
                </label>
                <FileField
                  field={multiFileFieldConfig}
                  value={multiFileValue}
                  onChange={(value) => {
                    console.log("MultiFile changed:", value);
                    if (Array.isArray(value)) {
                      setMultiFileValue(value);
                    }
                  }}
                />
              </div>

              {/* eKYC */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EkycField (Button Mode)
                </label>
                <FormProvider
                  value={{
                    formData,
                    setFieldValue: (fieldId: string, value: any) => {
                      setFormData((prev) => ({ ...prev, [fieldId]: value }));
                    },
                    errors: {},
                    setErrors: () => {},
                    touched: {},
                    setTouched: () => {},
                    validateField: () => false,
                    validateForm: () => false,
                    resetForm: () => {},
                    submitForm: () => {},
                  }}
                >
                  <EkycField
                    field={ekycFieldConfig}
                    value={ekycValue}
                    onChange={setEkycValue}
                  />
                </FormProvider>
              </div>
            </div>

            {/* Test Error States */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextField with Error
                </label>
                <TextField
                  field={textFieldConfig}
                  value=""
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error="This field is required"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SelectField with Error
                </label>
                <SelectField
                  field={selectFieldConfig}
                  value=""
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error="Please select an option"
                />
              </div>
            </div>
          </FormThemeProvider>
        </section>

        {/* Theme Comparison Table */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Comparison</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aspect
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Theme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Simplified Theme
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Lines of Code
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ~55 lines with complex CSS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ~45 lines with simple properties
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Placeholder Styling
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    4 different CSS selectors
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Handled in component
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Customization
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Requires CSS knowledge
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Simple color/size properties
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Maintenance
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    High - duplicate CSS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Low - DRY principles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Benefits Summary */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Key Improvements with Simplified Theme System
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>
                Reduced CSS selector explosion (removed 4 duplicate placeholder
                selectors)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>
                Moved common styling patterns to components where they belong
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>
                Much easier to create new themes - just change colors and sizes
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Better maintainability with DRY principles</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Type-safe theme properties with clear intent</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>
                Backward compatible - can use both systems during migration
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
