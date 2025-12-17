"use client";

import { FormThemeProvider } from "@/components/form-generation/themes/ThemeProvider";
import { legacyLoanTheme } from "@/components/form-generation/themes/legacy-loan";
import { legacyLoanThemeSimplified } from "@/components/form-generation/themes/legacy-loan-simplified";
import { expandTheme } from "@/components/form-generation/themes/theme-utils";
import { TextFieldSimplified } from "@/components/form-generation/fields/TextField-simplified";
import { SelectFieldSimplified } from "@/components/form-generation/fields/SelectField-simplified";
import { TextField } from "@/components/form-generation/fields/TextField";
import { SelectField } from "@/components/form-generation/fields/SelectField";
import { useState } from "react";

// Test data
const textFieldConfig = {
  id: "test-input",
  name: "testInput",
  type: "text" as const,
  label: "Test Input",
  placeholder: "Enter some text...",
};

const selectFieldConfig = {
  id: "test-select",
  name: "testSelect",
  type: "select" as const,
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

const textFieldWithAdornments = {
  ...textFieldConfig,
  id: "input-with-adornments",
  options: {
    prefix: "$",
    suffix: "USD",
  },
};

export default function ThemeTestPage() {
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [adornedValue, setAdornedValue] = useState("");

  const handleFieldChange = (value: string) => {
    console.log("Field changed:", value);
  };

  const handleFieldBlur = () => {
    console.log("Field blurred");
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
          <FormThemeProvider theme={expandTheme(legacyLoanThemeSimplified)}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TextField (Simplified)
                </label>
                <TextFieldSimplified
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
                <SelectFieldSimplified
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
              <TextFieldSimplified
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
              <TextFieldSimplified
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
              <TextFieldSimplified
                field={textFieldConfig}
                value="Disabled value"
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                disabled
              />
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
