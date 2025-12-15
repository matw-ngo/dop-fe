/**
 * Form Generation Library - Form Section Component
 */

'use client';

import { useState } from 'react';
import type { FormSection as FormSectionType } from '../types';
import { cn, evaluateConditions } from '../utils/helpers';
import { formSectionVariants } from '../styles/variants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicLayout } from './LayoutEngine';

export interface FormSectionProps {
    section: FormSectionType;
    formValues?: Record<string, any>;
    children: React.ReactNode;
    variant?: 'default' | 'bordered' | 'card';
}

export function FormSection({
    section,
    formValues = {},
    children,
    variant = 'default',
}: FormSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed || false);

    // Check dependencies
    const isVisible = section.dependencies
        ? evaluateConditions(
            section.dependencies[0]?.conditions || [],
            formValues,
            section.dependencies[0]?.logic
        )
        : true;

    if (!isVisible) {
        return null;
    }

    const showHeader = section.title || section.description;

    return (
        <div className={cn(formSectionVariants({ variant }), section.className)}>
            {/* Section Header */}
            {showHeader && (
                <div className="mb-4">
                    {section.title && (
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                            {section.collapsible && (
                                <button
                                    type="button"
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-expanded={!isCollapsed}
                                >
                                    {isCollapsed ? (
                                        <ChevronDown className="h-5 w-5" />
                                    ) : (
                                        <ChevronUp className="h-5 w-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                    {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                        </p>
                    )}
                </div>
            )}

            {/* Section Content */}
            {!isCollapsed && (
                <DynamicLayout
                    type={section.layout}
                    columns={section.columns}
                    gap={typeof section.gap === 'number' ? 'md' : (section.gap as any)}
                >
                    {children}
                </DynamicLayout>
            )}
        </div>
    );
}

FormSection.displayName = 'FormSection';
