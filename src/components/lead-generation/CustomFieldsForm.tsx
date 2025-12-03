/**
 * Custom Fields Form Component
 * Dynamic form fields for different loan types
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CustomFieldsFormProps {
  form: any;
  customFields: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
    label: string;
    required?: boolean;
    options?: string[];
    validation?: any;
  }>;
  language: 'vi' | 'en';
}

const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({
  form,
  customFields,
  language
}) => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();

  if (customFields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {language === 'vi' ? 'Không có thông tin bổ sung nào' : 'No additional information required'}
        </p>
      </div>
    );
  }

  const renderField = (field: any) => {
    const commonProps = {
      ...register(field.name, field.validation),
      className: errors[field.name] ? 'border-red-500' : '',
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={field.label}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.label}
            {...commonProps}
            {...register(field.name, { ...field.validation, valueAsNumber: true })}
          />
        );

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(field.name, value)}>
            <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.label} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={watch(field.name)}
              onCheckedChange={(checked) => setValue(field.name, checked)}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );

      case 'date':
        const selectedDate = watch(field.name);
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !selectedDate ? 'text-muted-foreground' : ''
                } ${errors[field.name] ? 'border-red-500' : ''}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(new Date(selectedDate), 'PPP')
                ) : (
                  <span>{field.label}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setValue(field.name, format(date, 'yyyy-MM-dd'));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
        {language === 'vi' ? 'Thông tin bổ sung' : 'Additional Information'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-sm text-red-600">
                {errors[field.name].message as string}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFieldsForm;