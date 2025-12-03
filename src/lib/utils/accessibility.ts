/**
 * Accessibility Utilities
 * Provides WCAG 2.1 compliant accessibility helpers
 */

/**
 * Generate unique ID for accessibility elements
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create accessible props for form fields
 */
export const createAccessibleFieldProps = (
  id: string,
  label: string,
  error?: string,
  description?: string,
  required?: boolean
) => {
  const fieldId = id;
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return {
    id: fieldId,
    'aria-label': label,
    'aria-required': required || false,
    'aria-invalid': !!error,
    'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-details': descriptionId,
  };
};

/**
 * Create accessible button props
 */
export const createAccessibleButtonProps = (
  label: string,
  disabled?: boolean,
  loading?: boolean
) => {
  return {
    'aria-label': label,
    'aria-disabled': disabled || loading || false,
    'aria-busy': loading || false,
  };
};

/**
 * Create accessible modal props
 */
export const createAccessibleModalProps = (title: string, isOpen: boolean) => {
  const titleId = generateAriaId('modal-title');
  const descriptionId = generateAriaId('modal-description');

  return {
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    'aria-hidden': !isOpen,
  };
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Handle common keyboard interactions
   */
  handleKeyboardInteraction: (
    event: React.KeyboardEvent,
    actions: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onTab?: () => void;
      onHome?: () => void;
      onEnd?: () => void;
    }
  ) => {
    switch (event.key) {
      case 'Enter':
        if (actions.onEnter) {
          event.preventDefault();
          actions.onEnter();
        }
        break;
      case ' ':
      case 'Space':
        if (actions.onSpace) {
          event.preventDefault();
          actions.onSpace();
        }
        break;
      case 'Escape':
        if (actions.onEscape) {
          event.preventDefault();
          actions.onEscape();
        }
        break;
      case 'ArrowUp':
        if (actions.onArrowUp) {
          event.preventDefault();
          actions.onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (actions.onArrowDown) {
          event.preventDefault();
          actions.onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (actions.onArrowLeft) {
          event.preventDefault();
          actions.onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (actions.onArrowRight) {
          event.preventDefault();
          actions.onArrowRight();
        }
        break;
      case 'Tab':
        if (actions.onTab) {
          actions.onTab();
        }
        break;
      case 'Home':
        if (actions.onHome) {
          event.preventDefault();
          actions.onHome();
        }
        break;
      case 'End':
        if (actions.onEnd) {
          event.preventDefault();
          actions.onEnd();
        }
        break;
    }
  },

  /**
   * Focus trap for modals and dropdowns
   */
  createFocusTrap: (containerRef: React.RefObject<HTMLElement>) => {
    const getFocusableElements = () => {
      if (!containerRef.current) return [];

      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];

      return Array.from(
        containerRef.current.querySelectorAll(focusableSelectors.join(', '))
      ) as HTMLElement[];
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    return {
      activate: () => {
        document.addEventListener('keydown', trapFocus);
      },
      deactivate: () => {
        document.removeEventListener('keydown', trapFocus);
      },
      focusFirst: () => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };
  },

  /**
   * Announce screen reader messages
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Create screen reader only text
   */
  only: (text: string) => {
    return (
      <span className="sr-only" aria-live="polite">
        {text}
      </span>
    );
  },

  /**
   * Hide element from screen reader
   */
  hidden: () => {
    return {
      'aria-hidden': true,
      tabIndex: -1,
    };
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const l1 = colorContrast.getLuminance(color1);
    const l2 = colorContrast.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standards
   */
  meetsWCAG_AA: (color1: string, color2: string, largeText: boolean = false): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    const minimum = largeText ? 3 : 4.5;
    return ratio >= minimum;
  },

  /**
   * Check if contrast meets WCAG AAA standards
   */
  meetsWCAG_AAA: (color1: string, color2: string, largeText: boolean = false): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    const minimum = largeText ? 4.5 : 7;
    return ratio >= minimum;
  },
};

/**
 * Form accessibility helpers
 */
export const formAccessibility = {
  /**
   * Create accessible form fieldset
   */
  createFieldset: (legend: string, description?: string) => ({
    role: 'group',
    'aria-label': legend,
    'aria-describedby': description ? generateAriaId('fieldset-desc') : undefined,
  }),

  /**
   * Create accessible form validation
   */
  createValidationProps: (isValid: boolean, message?: string) => {
    const messageId = message ? generateAriaId('validation') : undefined;

    return {
      'aria-invalid': !isValid,
      'aria-describedby': messageId,
      'aria-errormessage': isValid ? undefined : messageId,
    };
  },

  /**
   * Create accessible progress indicator
   */
  createProgressProps: (current: number, total: number, label: string) => {
    const percentage = Math.round((current / total) * 100);

    return {
      role: 'progressbar',
      'aria-valuenow': current,
      'aria-valuemin': 0,
      'aria-valuemax': total,
      'aria-label': label,
      'aria-valuetext': `${percentage}% complete`,
    };
  },
};

/**
 * Create accessible tabs
 */
export const createAccessibleTabs = (activeTab: string, onTabChange: (tab: string) => void) => ({
  role: 'tablist',
  'aria-orientation': 'horizontal',

  getTabProps: (tabId: string, label: string) => ({
    role: 'tab',
    id: `tab-${tabId}`,
    'aria-selected': activeTab === tabId,
    'aria-controls': `tabpanel-${tabId}`,
    tabIndex: activeTab === tabId ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent) => {
      keyboardNavigation.handleKeyboardInteraction(e, {
        onEnter: () => onTabChange(tabId),
        onSpace: () => onTabChange(tabId),
        onArrowUp: () => onTabChange(tabId),
        onArrowLeft: () => onTabChange(tabId),
      });
    },
  }),

  getTabPanelProps: (tabId: string) => ({
    role: 'tabpanel',
    id: `tabpanel-${tabId}`,
    'aria-labelledby': `tab-${tabId}`,
    hidden: activeTab !== tabId,
  }),
});

/**
 * Create accessible dropdown
 */
export const createAccessibleDropdown = (isOpen: boolean, onToggle: () => void) => {
  const id = generateAriaId('dropdown');

  return {
    triggerProps: {
      id: `${id}-trigger`,
      'aria-haspopup': 'listbox',
      'aria-expanded': isOpen,
      'aria-controls': `${id}-list`,
      onKeyDown: (e: React.KeyboardEvent) => {
        keyboardNavigation.handleKeyboardInteraction(e, {
          onEnter: onToggle,
          onSpace: onToggle,
          onArrowDown: () => {
            if (!isOpen) onToggle();
          },
          onEscape: () => {
            if (isOpen) onToggle();
          },
        });
      },
    },

    listProps: {
      id: `${id}-list`,
      role: 'listbox',
      'aria-labelledby': `${id}-trigger`,
    },

    getOptionProps: (value: string, label: string, isSelected: boolean, onSelect: (value: string) => void) => ({
      role: 'option',
      id: `${id}-option-${value}`,
      'aria-selected': isSelected,
      onClick: () => onSelect(value),
      onKeyDown: (e: React.KeyboardEvent) => {
        keyboardNavigation.handleKeyboardInteraction(e, {
          onEnter: () => onSelect(value),
          onSpace: () => onSelect(value),
        });
      },
    }),
  };
};