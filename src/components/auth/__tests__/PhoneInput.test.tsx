/**
 * PhoneInput Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneInput } from '../PhoneInput';

// Mock the telco utilities
jest.mock('@/lib/telcos/phone-validation', () => ({
  validateVietnamesePhone: jest.fn(),
  validatePhoneTyping: jest.fn(),
  formatPhoneTyping: jest.fn(),
  getPhoneSuggestions: jest.fn(),
  getPhoneMetadata: jest.fn(),
  TELCO_ERROR_MESSAGES: {
    INVALID_PHONE: 'Số điện thoại không hợp lệ',
    UNSUPPORTED_TELCO: 'Nhà mạng không được hỗ trợ',
    INVALID_OTP_LENGTH: 'Mã OTP không đúng độ dài',
    OTP_EXPIRED: 'Mã OTP đã hết hạn',
    MAX_ATTEMPTS_EXCEEDED: 'Đã đạt số lần thử tối đa',
    RESEND_COOLDOWN: 'Vui lòng đợi {{seconds}} giây',
    NETWORK_ERROR: 'Lỗi kết nối mạng',
    INVALID_OTP: 'Mã OTP không hợp lệ',
    RATE_LIMIT_EXCEEDED: 'Vượt giới hạn yêu cầu'
  }
}));

jest.mock('@/lib/telcos/telco-detector', () => ({
  detectTelco: jest.fn(),
  recordUserCorrection: jest.fn()
}));

jest.mock('@/lib/telcos/vietnamese-telcos', () => ({
  VIETNAMESE_TELCOS: {
    VIETTEL: {
      name: 'Viettel',
      code: 'VIETTEL',
      color: '#0033A0'
    },
    MOBIFONE: {
      name: 'Mobifone',
      code: 'MOBIFONE',
      color: '#FF6600'
    }
  }
}));

import { validateVietnamesePhone, validatePhoneTyping, formatPhoneTyping, getPhoneSuggestions, getPhoneMetadata } from '@/lib/telcos/phone-validation';
import { detectTelco } from '@/lib/telcos/telco-detector';
import { VIETNAMESE_TELCOS } from '@/lib/telcos/vietnamese-telcos';

const mockValidateVietnamesePhone = validateVietnamesePhone as jest.MockedFunction<typeof validateVietnamesePhone>;
const mockValidatePhoneTyping = validatePhoneTyping as jest.MockedFunction<typeof validatePhoneTyping>;
const mockFormatPhoneTyping = formatPhoneTyping as jest.MockedFunction<typeof formatPhoneTyping>;
const mockGetPhoneSuggestions = getPhoneSuggestions as jest.MockedFunction<typeof getPhoneSuggestions>;
const mockGetPhoneMetadata = getPhoneMetadata as jest.MockedFunction<typeof getPhoneMetadata>;
const mockDetectTelco = detectTelco as jest.MockedFunction<typeof detectTelco>;

describe('PhoneInput Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '',
      formattedNumber: '',
      telco: undefined,
      error: undefined,
      suggestion: undefined
    });

    mockValidateVietnamesePhone.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel'
    });

    mockFormatPhoneTyping.mockImplementation((input) => input);
    mockGetPhoneSuggestions.mockReturnValue([]);
    mockGetPhoneMetadata.mockReturnValue({
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      internationalNumber: '+84961234567',
      telco: 'Viettel',
      telcoCode: 'VIETTEL',
      isInternational: false,
      isValid: true,
      countryCode: '+84'
    });
    mockDetectTelco.mockReturnValue({
      telco: VIETNAMESE_TELCOS.VIETTEL,
      confidence: 0.98,
      phoneNumber: '0961234567',
      detectionMethod: 'prefix'
    });
  });

  test('renders phone input with label', () => {
    render(<PhoneInput label="Số điện thoại" />);

    expect(screen.getByLabelText('Số điện thoại')).toBeInTheDocument();
  });

  test('renders with default props', () => {
    render(<PhoneInput />);

    expect(screen.getByLabelText('Số điện thoại')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhập số điện thoại/)).toBeInTheDocument();
  });

  test('handles user input correctly', async () => {
    const onChange = jest.fn();
    render(<PhoneInput onChange={onChange} />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '0961234567');

    expect(mockFormatPhoneTyping).toHaveBeenCalledWith('0961234567');
    expect(mockGetPhoneSuggestions).toHaveBeenCalledWith('0961234567');
  });

  test('calls onChange with validation result', async () => {
    const onChange = jest.fn();
    mockValidatePhoneTyping.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel'
    });

    render(<PhoneInput onChange={onChange} />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '0961234567');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        '0961234567',
        true,
        expect.any(Object)
      );
    });
  });

  test('displays telco badge when telco is detected', async () => {
    render(<PhoneInput showTelcoBadge value="0961234567" />);

    await waitFor(() => {
      expect(screen.getByText('Viettel')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid phone', async () => {
    mockValidateVietnamesePhone.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '',
      formattedNumber: '',
      error: 'Số điện thoại không hợp lệ'
    });

    render(<PhoneInput value="123" validationMode="onblur" />);

    const input = screen.getByLabelText('Số điện thoại');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Số điện thoại không hợp lệ')).toBeInTheDocument();
    });
  });

  test('shows suggestions when available', async () => {
    mockGetPhoneSuggestions.mockReturnValue(['0961234567', '0962345678']);

    render(<PhoneInput showSuggestions />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '096');

    await waitFor(() => {
      expect(screen.getByText('0961234567')).toBeInTheDocument();
      expect(screen.getByText('0962345678')).toBeInTheDocument();
    });
  });

  test('handles suggestion click', async () => {
    const onChange = jest.fn();
    mockGetPhoneSuggestions.mockReturnValue(['0961234567']);

    render(<PhoneInput onChange={onChange} showSuggestions />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '096');

    await waitFor(() => {
      const suggestion = screen.getByText('0961234567');
      user.click(suggestion);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('0961234567', true, expect.any(Object));
    });
  });

  test('toggles phone format when international format is enabled', async () => {
    render(<PhoneInput value="0961234567" allowInternational />);

    const toggleButton = screen.getByRole('button', { name: /international/i });
    await user.click(toggleButton);

    await waitFor(() => {
      const input = screen.getByLabelText('Số điện thoại') as HTMLInputElement;
      expect(input.value).toBe('+84961234567');
    });
  });

  test('disables input when disabled prop is true', () => {
    render(<PhoneInput disabled />);

    const input = screen.getByLabelText('Số điện thoại') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('displays help text when focused', async () => {
    render(<PhoneInput />);

    const input = screen.getByLabelText('Số điện thoại');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Hỗ trợ các định dạng:/)).toBeInTheDocument();
      expect(screen.getByText(/Địa phương: 0912345678/)).toBeInTheDocument();
      expect(screen.getByText(/Quốc tế: \+84912345678/)).toBeInTheDocument();
    });
  });

  test('validates phone on blur when validationMode is onblur', async () => {
    const onChange = jest.fn();
    mockValidateVietnamesePhone.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '123',
      formattedNumber: '123',
      error: 'Số điện thoại không hợp lệ'
    });

    render(<PhoneInput onChange={onChange} validationMode="onblur" />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '123');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockValidateVietnamesePhone).toHaveBeenCalledWith('123');
      expect(onChange).toHaveBeenCalledWith('123', false, expect.any(Object));
    });
  });

  test('calls onTelcoDetected when telco changes', async () => {
    const onTelcoDetected = jest.fn();

    render(<PhoneInput value="0961234567" onTelcoDetected={onTelcoDetected} />);

    await waitFor(() => {
      expect(onTelcoDetected).toHaveBeenCalledWith(VIETNAMESE_TELCOS.VIETTEL);
    });
  });

  test('does not show suggestions when showSuggestions is false', async () => {
    mockGetPhoneSuggestions.mockReturnValue(['0961234567']);

    render(<PhoneInput showSuggestions={false} />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '096');

    // Should not show suggestions
    expect(screen.queryByText('0961234567')).not.toBeInTheDocument();
  });

  test('handles empty input gracefully', async () => {
    const onChange = jest.fn();
    render(<PhoneInput onChange={onChange} />);

    const input = screen.getByLabelText('Số điện thoại');
    await user.type(input, '123');
    await user.clear(input);

    expect(mockGetPhoneSuggestions).toHaveBeenCalledWith('');
    expect(mockGetPhoneSuggestions).not.toHaveBeenCalledWith('123');
  });
});