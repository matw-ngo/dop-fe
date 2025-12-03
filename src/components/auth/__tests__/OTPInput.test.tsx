/**
 * OTPInput Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OTPInput } from '../OTPInput';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    readText: jest.fn()
  }
});

describe('OTPInput Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (navigator.clipboard.readText as jest.Mock).mockResolvedValue('123456');
  });

  test('renders OTP input with 6 digits by default', () => {
    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');
    expect(inputs).toHaveLength(6);
  });

  test('renders OTP input with specified length', () => {
    render(<OTPInput length={4} />);

    const inputs = screen.getAllByDisplayValue('');
    expect(inputs).toHaveLength(4);
  });

  test('renders with custom label', () => {
    render(<OTPInput label="Nhập mã xác thực" />);

    expect(screen.getByText('Nhập mã xác thực')).toBeInTheDocument();
  });

  test('handles digit input correctly', async () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);

    const inputs = screen.getAllByDisplayValue('');

    await user.type(inputs[0], '1');

    expect(inputs[0]).toHaveValue('1');
    expect(onChange).toHaveBeenCalledWith('1', false);
  });

  test('auto-focuses next input after typing', async () => {
    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');

    await user.type(inputs[0], '1');

    await waitFor(() => {
      expect(inputs[1]).toHaveFocus();
    });
  });

  test('auto-submits when all digits are entered', async () => {
    const onComplete = jest.fn();
    render(<OTPInput onComplete={onComplete} />);

    const inputs = screen.getAllByDisplayValue('');

    // Type all 6 digits
    await user.type(inputs[0], '123456');

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('123456');
    });
  });

  test('handles backspace navigation', async () => {
    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');

    // Type in first input
    await user.type(inputs[0], '1');
    expect(inputs[0]).toHaveValue('1');

    // Focus second input and press backspace
    inputs[1].focus();
    await user.keyboard('{Backspace}');

    await waitFor(() => {
      expect(inputs[0]).toHaveFocus();
    });
  });

  test('handles paste functionality', async () => {
    const onPaste = jest.fn();
    render(<OTPInput onPaste={onPaste} />);

    const inputs = screen.getAllByDisplayValue('');
    inputs[0].focus();

    // Simulate paste
    await user.keyboard('{Control>}{v}{/Control}');

    await waitFor(() => {
      expect(onPaste).toHaveBeenCalledWith('123456');
      expect(inputs[0]).toHaveValue('1');
      expect(inputs[1]).toHaveValue('2');
      expect(inputs[2]).toHaveValue('3');
      expect(inputs[3]).toHaveValue('4');
      expect(inputs[4]).toHaveValue('5');
      expect(inputs[5]).toHaveValue('6');
    });
  });

  test('handles arrow key navigation', async () => {
    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');
    inputs[2].focus();

    await user.keyboard('{ArrowLeft}');
    expect(inputs[1]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(inputs[2]).toHaveFocus();
  });

  test('handles Enter key submission', async () => {
    const onComplete = jest.fn();
    render(<OTPInput onComplete={onComplete} />);

    const inputs = screen.getAllByDisplayValue('');

    // Fill all inputs
    for (let i = 0; i < inputs.length; i++) {
      await user.type(inputs[i], (i + 1).toString());
    }

    // Press Enter on last input
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('123456');
    });
  });

  test('clears all inputs when clear button is clicked', async () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);

    const inputs = screen.getAllByDisplayValue('');

    // Type in first input to show clear button
    await user.type(inputs[0], '1');

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(inputs[0]).toHaveValue('');
      expect(inputs[0]).toHaveFocus();
    });
  });

  test('toggles secure mode', async () => {
    render(<OTPInput value="123" showSecureToggle />);

    const secureToggle = screen.getByRole('button', { name: /show/i });
    await user.click(secureToggle);

    // Check if eye-off icon is present (secure mode)
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
  });

  test('shows timer when enabled', () => {
    render(<OTPInput showTimer timerDuration={300} />);

    expect(screen.getByText(/Thời gian còn lại/)).toBeInTheDocument();
    expect(screen.getByText(/5:00/)).toBeInTheDocument();
  });

  test('shows progress bar when timer is enabled', () => {
    render(<OTPInput showTimer timerDuration={300} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays validation error', () => {
    render(<OTPInput error="Mã OTP không hợp lệ" />);

    expect(screen.getByText('Mã OTP không hợp lệ')).toBeInTheDocument();
  });

  test('shows success message when valid', () => {
    render(<OTPInput value="123456" length={6} />);

    // Should show success indicator when complete
    const successIndicator = screen.getByTestId('otp-success');
    expect(successIndicator).toBeInTheDocument();
  });

  test('respects maxLength prop', async () => {
    const onChange = jest.fn();
    render(<OTPInput maxLength={4} onChange={onChange} />);

    const inputs = screen.getAllByDisplayValue('');

    // Type more than maxLength
    await user.type(inputs[0], '12345678');

    // Should not exceed maxLength
    expect(inputs[0]).toHaveValue('1');
  });

  test('applies pattern validation', async () => {
    render(<OTPInput pattern={/^[0-9]{4}$/} length={4} />);

    const inputs = screen.getAllByDisplayValue('');

    // Type valid input
    await user.type(inputs[0], '1234');

    // Should accept valid input
    expect(inputs[0]).toHaveValue('1');
  });

  test('disables all inputs when disabled', () => {
    render(<OTPInput disabled />);

    const inputs = screen.getAllByDisplayValue('');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  test('applies custom className', () => {
    const { container } = render(<OTPInput className="custom-otp-input" />);

    expect(container.querySelector('.custom-otp-input')).toBeInTheDocument();
  });

  test('handles container click to focus first empty input', async () => {
    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');
    const container = inputs[0].closest('div')?.parentElement;

    if (container) {
      await user.click(container);
      expect(inputs[0]).toHaveFocus();
    }
  });

  test('shows description text', () => {
    render(<OTPInput description="Nhập mã 6 chữ số" />);

    expect(screen.getByText('Nhập mã 6 chữ số')).toBeInTheDocument();
  });

  test('shows help text', () => {
    render(<OTPInput helpText="Mã OTP có hiệu lực trong 5 phút" />);

    expect(screen.getByText('Mã OTP có hiệu lực trong 5 phút')).toBeInTheDocument();
  });

  test('handles paste error gracefully', async () => {
    // Mock clipboard read error
    (navigator.clipboard.readText as jest.Mock).mockRejectedValue(new Error('Clipboard error'));

    render(<OTPInput />);

    const inputs = screen.getAllByDisplayValue('');
    inputs[0].focus();

    // Attempt paste
    await user.keyboard('{Control>}{v}{/Control}');

    // Should not throw error
    expect(inputs[0]).toHaveValue('');
  });

  test('auto-focuses first input when autoFocus is true', () => {
    render(<OTPInput autoFocus />);

    const inputs = screen.getAllByDisplayValue('');
    expect(inputs[0]).toHaveFocus();
  });
});