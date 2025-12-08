import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormRenderer } from './FormRenderer';
import type { RawFieldConfig } from './types/data-driven-ui';

// Mock all dependencies
vi.mock('@/hooks/ui/use-safe-translations', () => ({
  useSafeTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@/hooks/form/use-form-processing', () => ({
  useFormProcessing: vi.fn(),
}));

vi.mock('@/hooks/form/use-form-validation', () => ({
  useFormValidation: vi.fn(),
}));

vi.mock('@/hooks/form/use-field-visibility', () => ({
  useFieldVisibility: vi.fn(),
}));

vi.mock('@/hooks/form/use-async-options', () => ({
  useMultipleAsyncOptions: vi.fn(),
}));

vi.mock('../utils/form-class-names', () => ({
  useFormClassNames: vi.fn(),
}));

vi.mock('@/components/renderer/FieldRenderer', () => ({
  FieldRenderer: vi.fn(({ fieldConfig }) => (
    <div data-testid={`field-${fieldConfig.fieldName}`}>
      {fieldConfig.props.label}
    </div>
  )),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  FormProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => children,
}));

import { useFormProcessing } from '@/hooks/form/use-form-processing';
import { useFormValidation } from '@/hooks/form/use-form-validation';
import { useFieldVisibility } from '@/hooks/form/use-field-visibility';
import { useMultipleAsyncOptions } from '@/hooks/form/use-async-options';
import { useFormClassNames } from './utils/form-class-names';
import { useForm } from 'react-hook-form';

// Type mocks properly
const mockedUseFormProcessing = vi.mocked(useFormProcessing);
const mockedUseFormValidation = vi.mocked(useFormValidation);
const mockedUseFieldVisibility = vi.mocked(useFieldVisibility);
const mockedUseMultipleAsyncOptions = vi.mocked(useMultipleAsyncOptions);
const mockedUseFormClassNames = vi.mocked(useFormClassNames);
const mockedUseForm = vi.mocked(useForm);

// Helper for creating complete useForm mock
const createMockUseForm = (overrides: any = {}) => {
  const mockData = overrides.watch?.() || {};
  return {
    watch: vi.fn().mockReturnValue(mockData),
    handleSubmit: vi.fn((cb) => {
      // Return a function that will be called as onSubmit handler
      return (e: any) => {
        e?.preventDefault?.();
        // Execute the callback with form data
        return cb(mockData);
      };
    }),
    getValues: vi.fn().mockReturnValue(mockData),
    getFieldState: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    setValue: vi.fn(),
    trigger: vi.fn(),
    reset: vi.fn(),
    resetField: vi.fn(),
    unregister: vi.fn(),
    register: vi.fn(),
    setFocus: vi.fn(),
    subscribe: vi.fn(),
    control: {} as any,
    formState: {
      isValid: true,
      isDirty: false,
      errors: {},
      isLoading: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isSubmitting: false,
      isValidating: false,
      dirtyFields: {},
      touchedFields: {},
      submitCount: 0,
    },
    ...overrides,
  } as any;
};

describe('FormRenderer', () => {
  const mockFields: RawFieldConfig[] = [
    {
      fieldName: 'name',
      component: 'Input',
      props: {
        label: 'Name',
        type: 'text',
      },
    },
    {
      fieldName: 'email',
      component: 'Input',
      props: {
        label: 'Email',
        type: 'email',
        validations: [{ type: 'required' }],
      },
    },
  ];

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockedUseFormProcessing.mockReturnValue({
      processedFields: mockFields as any,
      computedDefaultValues: {},
    });

    mockedUseFormValidation.mockReturnValue({
      resolver: vi.fn(),
      mode: 'onSubmit',
      formSchema: {} as any,
    });

    mockedUseFieldVisibility.mockReturnValue({
      visibleFields: mockFields as any,
      visibleFieldNames: new Set(['name', 'email']),
      shouldRenderField: vi.fn(() => true),
    });

    mockedUseMultipleAsyncOptions.mockReturnValue({});

    mockedUseFormClassNames.mockReturnValue({
      formClasses: 'test-form-class',
      formResponsiveClasses: '',
      formLayoutClasses: '',
      formVariantClasses: '',
    });

    mockedUseForm.mockReturnValue(createMockUseForm());
  });

  it('should render form with fields', () => {
    render(<FormRenderer fields={mockFields} onSubmit={mockOnSubmit} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('test-form-class');
    expect(screen.getByTestId('field-name')).toBeInTheDocument();
    expect(screen.getByTestId('field-email')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    // Mock useFormClassNames to merge the custom className
    mockedUseFormClassNames.mockReturnValue({
      formClasses: 'test-form-class custom-class',
      formResponsiveClasses: '',
      formLayoutClasses: '',
      formVariantClasses: '',
    });

    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        className="custom-class"
      />
    );

    const form = document.querySelector('form');
    expect(form).toHaveClass('test-form-class', 'custom-class');
  });

  it('should render form actions when provided', () => {
    const FormActions = <button type="button">Custom Action</button>;

    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        formActions={FormActions}
      />
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const formData = { name: 'John', email: 'john@example.com' };
    mockedUseForm.mockReturnValue(createMockUseForm({
      watch: vi.fn().mockReturnValue(formData)
    }));

    render(<FormRenderer fields={mockFields} onSubmit={mockOnSubmit} />);

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(formData);
    });
  });

  it('should filter submission data to visible fields only', async () => {
    const allFormData = { name: 'John', email: 'john@example.com', hidden: 'value' };
    const expectedFormData = { name: 'John', email: 'john@example.com' };

    mockedUseForm.mockReturnValue(createMockUseForm({
      watch: vi.fn().mockReturnValue(allFormData)
    }));

    mockedUseFieldVisibility.mockReturnValue({
      visibleFields: mockFields as any,
      visibleFieldNames: new Set(['name', 'email']), // 'hidden' field is not visible
      shouldRenderField: vi.fn(() => true),
    });

    render(<FormRenderer fields={mockFields} onSubmit={mockOnSubmit} />);

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expectedFormData);
    });
  });

  it('should handle submission errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Submission failed');
    mockOnSubmit.mockRejectedValue(error);

    const formData = { name: 'John', email: 'john@example.com' };
    mockedUseForm.mockReturnValue(createMockUseForm({
      watch: vi.fn().mockReturnValue(formData)
    }));

    render(<FormRenderer fields={mockFields} onSubmit={mockOnSubmit} />);

    const form = document.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', error);
    });

    consoleSpy.mockRestore();
  });

  it('should pass validation options correctly', () => {
    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        validateOnChange={true}
        validateOnBlur={false}
      />
    );

    expect(useFormValidation).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Function),
      {
        validateOnChange: true,
        validateOnBlur: false,
        defaultValues: {},
      }
    );
  });

  it('should pass translation namespace to FieldRenderer', () => {
    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        translationNamespace="my-form"
      />
    );

    // FieldRenderer should receive the namespace
    expect(screen.getByTestId('field-name')).toBeInTheDocument();
  });

  it('should apply grid layout classes correctly', () => {
    mockedUseFormClassNames.mockReturnValue({
      formClasses: 'grid gap-4 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      formResponsiveClasses: '',
      formLayoutClasses: '',
      formVariantClasses: '',
    });

    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        layout="grid"
      />
    );

    const form = document.querySelector('form');
    expect(form).toHaveClass('grid');
  });

  it('should handle empty fields array', () => {
    render(<FormRenderer fields={[]} onSubmit={mockOnSubmit} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    // No fields should be rendered
  });

  it('should support custom style prop', () => {
    const customStyle = { backgroundColor: 'red' };

    render(
      <FormRenderer
        fields={mockFields}
        onSubmit={mockOnSubmit}
        style={customStyle}
      />
    );

    // Form element receives the style prop (browser converts color names to rgb)
    const form = document.querySelector('form');
    expect(form).toHaveStyle('background-color: rgb(255, 0, 0)');
  });
});