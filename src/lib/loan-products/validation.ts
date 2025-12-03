// Financial Calculation Validation Module
// Comprehensive input validation and sanitization for Vietnamese loan calculations

import type { LoanCalculationParams } from "./interest-calculations";
import type { VietnameseLoanProduct, VietnameseLoanType } from "./vietnamese-loan-products";

/**
 * Validation error
 */
export interface ValidationError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Error message in Vietnamese */
  messageVi: string;
  /** Error severity */
  severity: "error" | "warning" | "info";
  /** Error code */
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** Whether validation has warnings */
  hasWarnings: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Sanitized parameters */
  sanitizedParams?: LoanCalculationParams;
}

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  /** Enable rounding to nearest VND */
  roundToVND?: boolean;
  /** Enable decimal places precision */
  decimalPlaces?: number;
  /** Sanitize text inputs */
  sanitizeText?: boolean;
  /** Remove sensitive data from logs */
  removeSensitiveData?: boolean;
}

/**
 * Vietnamese Financial Validator
 */
export class VietnameseFinancialValidator {
  /**
   * Validate and sanitize loan calculation parameters
   */
  static validateAndSanitize(
    params: LoanCalculationParams,
    product?: VietnameseLoanProduct,
    options: SanitizationOptions = {}
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const sanitizedParams = this.sanitizeParameters(params, options);

    // Validate principal amount
    this.validatePrincipal(sanitizedParams.principal, errors);

    // Validate loan term
    this.validateTerm(sanitizedParams.term, errors);

    // Validate interest rates
    this.validateInterestRates(sanitizedParams, errors);

    // Validate fees
    this.validateFees(sanitizedParams, errors);

    // Validate dates
    this.validateDates(sanitizedParams, errors);

    // Validate rate type and method
    this.validateRateType(sanitizedParams, errors);

    // Validate promotional period
    this.validatePromotionalPeriod(sanitizedParams, errors);

    // Validate against product constraints if product provided
    if (product) {
      this.validateProductConstraints(sanitizedParams, product, errors);
    }

    // Validate Vietnamese banking limits
    this.validateVietnameseLimits(sanitizedParams, errors);

    // Check for calculation consistency
    this.validateCalculationConsistency(sanitizedParams, errors);

    const isValid = errors.filter(e => e.severity === "error").length === 0;
    const hasWarnings = errors.filter(e => e.severity === "warning").length > 0;

    return {
      isValid,
      hasWarnings,
      errors,
      sanitizedParams: isValid ? sanitizedParams : undefined,
    };
  }

  /**
   * Validate loan product data
   */
  static validateLoanProduct(product: VietnameseLoanProduct): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate basic product information
    if (!product.id || product.id.trim() === "") {
      errors.push({
        field: "id",
        message: "Product ID is required",
        messageVi: "ID sản phẩm là bắt buộc",
        severity: "error",
        code: "REQUIRED_FIELD",
      });
    }

    if (!product.nameVi || product.nameVi.trim() === "") {
      errors.push({
        field: "nameVi",
        message: "Vietnamese product name is required",
        messageVi: "Tên sản phẩm tiếng Việt là bắt buộc",
        severity: "error",
        code: "REQUIRED_FIELD",
      });
    }

    // Validate bank information
    if (!product.bank || !product.bank.code) {
      errors.push({
        field: "bank",
        message: "Bank information is required",
        messageVi: "Thông tin ngân hàng là bắt buộc",
        severity: "error",
        code: "REQUIRED_FIELD",
      });
    }

    // Validate amount limits
    this.validateAmountLimits(product.amountLimits, errors);

    // Validate term options
    this.validateTermOptions(product.termOptions, errors);

    // Validate interest rate
    this.validateProductInterestRate(product.interestRate, product.loanType, errors);

    // Validate fee structure
    this.validateFeeStructure(product.fees, errors);

    // Validate eligibility criteria
    this.validateEligibilityCriteria(product.eligibility, errors);

    // Validate SBV compliance
    this.validateSBVCompliance(product, errors);

    const isValid = errors.filter(e => e.severity === "error").length === 0;
    const hasWarnings = errors.filter(e => e.severity === "warning").length > 0;

    return {
      isValid,
      hasWarnings,
      errors,
      sanitizedParams: undefined,
    };
  }

  /**
   * Sanitize calculation parameters
   */
  private static sanitizeParameters(
    params: LoanCalculationParams,
    options: SanitizationOptions
  ): LoanCalculationParams {
    const sanitized: LoanCalculationParams = { ...params };

    // Sanitize numeric values
    sanitized.principal = this.sanitizeNumber(params.principal, 0, Number.MAX_SAFE_INTEGER);
    sanitized.term = this.sanitizeNumber(params.term, 1, 600); // Max 50 years
    sanitized.annualRate = this.sanitizeNumber(params.annualRate, 0, 100);
    sanitized.promotionalRate = params.promotionalRate ?
      this.sanitizeNumber(params.promotionalRate, 0, 100) : undefined;
    sanitized.promotionalPeriod = params.promotionalPeriod ?
      this.sanitizeNumber(params.promotionalPeriod, 0, sanitized.term) : undefined;

    // Sanitize fees
    sanitized.processingFee = params.processingFee ?
      this.sanitizeNumber(params.processingFee, 0, 100) : 0;
    sanitized.processingFeeFixed = params.processingFeeFixed ?
      this.sanitizeNumber(params.processingFeeFixed, 0, Number.MAX_SAFE_INTEGER) : 0;
    sanitized.insuranceFee = params.insuranceFee ?
      this.sanitizeNumber(params.insuranceFee, 0, 100) : 0;
    sanitized.otherFees = params.otherFees ?
      this.sanitizeNumber(params.otherFees, 0, Number.MAX_SAFE_INTEGER) : 0;

    // Sanitize grace period
    sanitized.gracePeriod = params.gracePeriod ?
      this.sanitizeNumber(params.gracePeriod, 0, sanitized.term) : 0;

    // Sanitize rate type
    const validRateTypes: Array<"fixed" | "reducing" | "flat" | "floating"> =
      ["fixed", "reducing", "flat", "floating"];
    if (!validRateTypes.includes(sanitized.rateType)) {
      sanitized.rateType = "reducing"; // Default to reducing
    }

    // Sanitize calculation method
    const validMethods: Array<"daily" | "monthly"> = ["daily", "monthly"];
    if (!validMethods.includes(sanitized.calculationMethod)) {
      sanitized.calculationMethod = "monthly"; // Default to monthly
    }

    // Apply rounding if requested
    if (options.roundToVND !== false) {
      sanitized.principal = Math.round(sanitized.principal);
      sanitized.processingFeeFixed = Math.round(sanitized.processingFeeFixed);
      sanitized.otherFees = Math.round(sanitized.otherFees);
    }

    // Ensure valid date
    if (!sanitized.firstPaymentDate || isNaN(sanitized.firstPaymentDate.getTime())) {
      sanitized.firstPaymentDate = new Date();
    }

    // Ensure future date for first payment
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sanitized.firstPaymentDate < today) {
      sanitized.firstPaymentDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    }

    return sanitized;
  }

  /**
   * Sanitize number within bounds
   */
  private static sanitizeNumber(value: any, min: number, max: number): number {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Validate principal amount
   */
  private static validatePrincipal(principal: number, errors: ValidationError[]): void {
    if (principal <= 0) {
      errors.push({
        field: "principal",
        message: "Principal amount must be greater than 0",
        messageVi: "Số tiền gốc phải lớn hơn 0",
        severity: "error",
        code: "INVALID_PRINCIPAL",
      });
    }

    if (principal < 1000000) { // 1 triệu VND minimum
      errors.push({
        field: "principal",
        message: "Principal amount is too small (minimum 1 triệu VND)",
        messageVi: "Số tiền gốc quá nhỏ (tối thiểu 1 triệu VND)",
        severity: "warning",
        code: "SMALL_PRINCIPAL",
      });
    }

    if (principal > 1000000000000) { // 1 nghìn tỷ VND maximum
      errors.push({
        field: "principal",
        message: "Principal amount exceeds maximum limit (1 tỷ VND)",
        messageVi: "Số tiền gốc vượt quá giới hạn tối đa (1 tỷ VND)",
        severity: "error",
        code: "EXCESSIVE_PRINCIPAL",
      });
    }
  }

  /**
   * Validate loan term
   */
  private static validateTerm(term: number, errors: ValidationError[]): void {
    if (term <= 0) {
      errors.push({
        field: "term",
        message: "Loan term must be greater than 0",
        messageVi: "Thời gian vay phải lớn hơn 0",
        severity: "error",
        code: "INVALID_TERM",
      });
    }

    if (term > 600) { // 50 years maximum
      errors.push({
        field: "term",
        message: "Loan term exceeds maximum limit (50 years)",
        messageVi: "Thời gian vay vượt quá giới hạn tối đa (50 năm)",
        severity: "error",
        code: "EXCESSIVE_TERM",
      });
    }

    if (term < 6) {
      errors.push({
        field: "term",
        message: "Loan term is very short (minimum 6 months recommended)",
        messageVi: "Thời gian vay rất ngắn (khuyến nghị tối thiểu 6 tháng)",
        severity: "warning",
        code: "SHORT_TERM",
      });
    }
  }

  /**
   * Validate interest rates
   */
  private static validateInterestRates(params: LoanCalculationParams, errors: ValidationError[]): void {
    if (params.annualRate < 0) {
      errors.push({
        field: "annualRate",
        message: "Annual interest rate cannot be negative",
        messageVi: "Lãi suất hàng năm không thể âm",
        severity: "error",
        code: "NEGATIVE_RATE",
      });
    }

    if (params.annualRate > 50) {
      errors.push({
        field: "annualRate",
        message: "Annual interest rate is unusually high (>50%)",
        messageVi: "Lãi suất hàng năm unusually cao (>50%)",
        severity: "warning",
        code: "HIGH_RATE",
      });
    }

    if (params.promotionalRate !== undefined) {
      if (params.promotionalRate < 0) {
        errors.push({
          field: "promotionalRate",
          message: "Promotional interest rate cannot be negative",
          messageVi: "Lãi suất ưu đãi không thể âm",
          severity: "error",
          code: "NEGATIVE_PROMOTIONAL_RATE",
        });
      }

      if (params.promotionalRate >= params.annualRate) {
        errors.push({
          field: "promotionalRate",
          message: "Promotional rate should be lower than standard rate",
          messageVi: "Lãi suất ưu đãi nên thấp hơn lãi suất tiêu chuẩn",
          severity: "warning",
          code: "INVALID_PROMOTIONAL_RATE",
        });
      }
    }
  }

  /**
   * Validate fees
   */
  private static validateFees(params: LoanCalculationParams, errors: ValidationError[]): void {
    if (params.processingFee && params.processingFee > 10) {
      errors.push({
        field: "processingFee",
        message: "Processing fee percentage is unusually high (>10%)",
        messageVi: "Phí xử lý phần tr unusually cao (>10%)",
        severity: "warning",
        code: "HIGH_PROCESSING_FEE",
      });
    }

    const totalFees = (params.processingFee || 0) +
                     (params.insuranceFee || 0);
    if (totalFees > 20) {
      errors.push({
        field: "totalFees",
        message: "Total fee percentage is very high (>20%)",
        messageVi: "Tổng phí phần tr rất cao (>20%)",
        severity: "warning",
        code: "HIGH_TOTAL_FEES",
      });
    }

    const totalFeeAmount = (params.processingFeeFixed || 0) + (params.otherFees || 0);
    if (totalFeeAmount > params.principal * 0.1) {
      errors.push({
        field: "fixedFees",
        message: "Fixed fees exceed 10% of principal amount",
        messageVi: "Phí cố định vượt quá 10% số tiền gốc",
        severity: "warning",
        code: "HIGH_FIXED_FEES",
      });
    }
  }

  /**
   * Validate dates
   */
  private static validateDates(params: LoanCalculationParams, errors: ValidationError[]): void {
    if (params.firstPaymentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (params.firstPaymentDate < today) {
        errors.push({
          field: "firstPaymentDate",
          message: "First payment date cannot be in the past",
          messageVi: "Ngày thanh toán đầu tiên không thể là ngày trong quá khứ",
          severity: "error",
          code: "PAST_PAYMENT_DATE",
        });
      }

      const maxFutureDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      if (params.firstPaymentDate > maxFutureDate) {
        errors.push({
          field: "firstPaymentDate",
          message: "First payment date is too far in the future (>1 year)",
          messageVi: "Ngày thanh toán đầu tiên quá xa trong tương lai (>1 năm)",
          severity: "warning",
          code: "FAR_FUTURE_PAYMENT_DATE",
        });
      }
    }
  }

  /**
   * Validate rate type
   */
  private static validateRateType(params: LoanCalculationParams, errors: ValidationError[]): void {
    const validTypes = ["fixed", "reducing", "flat", "floating"];
    if (!validTypes.includes(params.rateType)) {
      errors.push({
        field: "rateType",
        message: "Invalid interest rate type",
        messageVi: "Loại lãi suất không hợp lệ",
        severity: "error",
        code: "INVALID_RATE_TYPE",
      });
    }

    const validMethods = ["daily", "monthly"];
    if (!validMethods.includes(params.calculationMethod)) {
      errors.push({
        field: "calculationMethod",
        message: "Invalid calculation method",
        messageVi: "Phương pháp tính toán không hợp lệ",
        severity: "error",
        code: "INVALID_CALCULATION_METHOD",
      });
    }
  }

  /**
   * Validate promotional period
   */
  private static validatePromotionalPeriod(params: LoanCalculationParams, errors: ValidationError[]): void {
    if (params.promotionalPeriod !== undefined) {
      if (params.promotionalPeriod <= 0) {
        errors.push({
          field: "promotionalPeriod",
          message: "Promotional period must be greater than 0",
          messageVi: "Thời gian ưu đãi phải lớn hơn 0",
          severity: "error",
          code: "INVALID_PROMOTIONAL_PERIOD",
        });
      }

      if (params.promotionalPeriod >= params.term) {
        errors.push({
          field: "promotionalPeriod",
          message: "Promotional period cannot be equal to or greater than loan term",
          messageVi: "Thời gian ưu đãi không thể bằng hoặc lớn hơn thời gian vay",
          severity: "error",
          code: "PROMOTIONAL_PERIOD_TOO_LONG",
        });
      }

      if (!params.promotionalRate) {
        errors.push({
          field: "promotionalRate",
          message: "Promotional rate is required when promotional period is specified",
          messageVi: "Lãi suất ưu đãi là bắt buộc khi chỉ định thời gian ưu đãi",
          severity: "error",
          code: "MISSING_PROMOTIONAL_RATE",
        });
      }
    }

    if (params.promotionalRate && !params.promotionalPeriod) {
      errors.push({
        field: "promotionalPeriod",
        message: "Promotional period is required when promotional rate is specified",
        messageVi: "Thời gian ưu đãi là bắt buộc khi chỉ định lãi suất ưu đãi",
        severity: "error",
        code: "MISSING_PROMOTIONAL_PERIOD",
      });
    }
  }

  /**
   * Validate against product constraints
   */
  private static validateProductConstraints(
    params: LoanCalculationParams,
    product: VietnameseLoanProduct,
    errors: ValidationError[]
  ): void {
    // Validate amount limits
    if (params.principal < product.amountLimits.min) {
      errors.push({
        field: "principal",
        message: `Principal amount is below minimum for this product (${product.amountLimits.min.toLocaleString()} VND)`,
        messageVi: `Số tiền gốc thấp hơn tối thiểu cho sản phẩm này (${product.amountLimits.min.toLocaleString()} VND)`,
        severity: "error",
        code: "BELOW_MIN_AMOUNT",
      });
    }

    if (params.principal > product.amountLimits.max) {
      errors.push({
        field: "principal",
        message: `Principal amount exceeds maximum for this product (${product.amountLimits.max.toLocaleString()} VND)`,
        messageVi: `Số tiền gốc vượt quá tối đa cho sản phẩm này (${product.amountLimits.max.toLocaleString()} VND)`,
        severity: "error",
        code: "ABOVE_MAX_AMOUNT",
      });
    }

    // Validate term limits
    if (params.term < product.termOptions.min) {
      errors.push({
        field: "term",
        message: `Loan term is below minimum for this product (${product.termOptions.min} months)`,
        messageVi: `Thời gian vay thấp hơn tối thiểu cho sản phẩm này (${product.termOptions.min} tháng)`,
        severity: "error",
        code: "BELOW_MIN_TERM",
      });
    }

    if (params.term > product.termOptions.max) {
      errors.push({
        field: "term",
        message: `Loan term exceeds maximum for this product (${product.termOptions.max} months)`,
        messageVi: `Thời gian vay vượt quá tối đa cho sản phẩm này (${product.termOptions.max} tháng)`,
        severity: "error",
        code: "ABOVE_MAX_TERM",
      });
    }

    // Validate available terms
    if (product.termOptions.availableTerms.length > 0 &&
        !product.termOptions.availableTerms.includes(params.term)) {
      errors.push({
        field: "term",
        message: `Loan term is not available for this product. Available terms: ${product.termOptions.availableTerms.join(", ")}`,
        messageVi: `Thời gian vay không có sẵn cho sản phẩm này. Các kỳ hạn có sẵn: ${product.termOptions.availableTerms.join(", ")}`,
        severity: "error",
        code: "UNAVAILABLE_TERM",
      });
    }

    // Validate rate type match
    if (params.rateType !== product.interestRate.type) {
      errors.push({
        field: "rateType",
        message: `Interest rate type mismatch. Product uses ${product.interestRate.type}`,
        messageVi: `Không khớp loại lãi suất. Sản phẩm sử dụng ${product.interestRate.type}`,
        severity: "error",
        code: "RATE_TYPE_MISMATCH",
      });
    }
  }

  /**
   * Validate Vietnamese banking limits
   */
  private static validateVietnameseLimits(params: LoanCalculationParams, errors: ValidationError[]): void {
    // SBV guidelines for consumer loans
    if (params.annualRate > 20) {
      errors.push({
        field: "annualRate",
        message: "Interest rate exceeds SBV guideline for consumer loans (20%)",
        messageVi: "Lãi suất vượt quá khuyến nghị của SBV cho vay tiêu dùng (20%)",
        severity: "warning",
        code: "EXCEEDS_SBV_GUIDELINE",
      });
    }

    // Reasonable APR checks
    const estimatedAPR = params.annualRate + (params.processingFee || 0) + (params.insuranceFee || 0);
    if (estimatedAPR > 35) {
      errors.push({
        field: "estimatedAPR",
        message: "Estimated APR is very high (>35%) - please verify all costs",
        messageVi: "APR ước tính rất cao (>35%) - vui lòng xác minh tất cả chi phí",
        severity: "warning",
        code: "HIGH_APR",
      });
    }
  }

  /**
   * Validate calculation consistency
   */
  private static validateCalculationConsistency(params: LoanCalculationParams, errors: ValidationError[]): void {
    // Check for logical inconsistencies
    if (params.gracePeriod && params.gracePeriod >= params.term) {
      errors.push({
        field: "gracePeriod",
        message: "Grace period cannot equal or exceed loan term",
        messageVi: "Thời gian ân hạn không thể bằng hoặc vượt quá thời gian vay",
        severity: "error",
        code: "INVALID_GRACE_PERIOD",
      });
    }

    // Check for unusual parameter combinations
    if (params.rateType === "flat" && params.promotionalRate) {
      errors.push({
        field: "promotionalRate",
        message: "Promotional rates are uncommon with flat rate calculations",
        messageVi: "Lãi suất ưu đãi không phổ biến với tính toán lãi suất phẳng",
        severity: "warning",
        code: "UNUSUAL_PROMOTION",
      });
    }

    // Validate grace period with rate type
    if (params.gracePeriod && params.gracePeriod > 0 && params.rateType === "flat") {
      errors.push({
        field: "gracePeriod",
        message: "Grace periods are typically used with reducing balance loans",
        messageVi: "Thời gian ân hạn thường được sử dụng với vay lãi suất giảm dần",
        severity: "info",
        code: "GRACE_PERIOD_INFO",
      });
    }
  }

  /**
   * Validate amount limits
   */
  private static validateAmountLimits(amountLimits: any, errors: ValidationError[]): void {
    if (amountLimits.min >= amountLimits.max) {
      errors.push({
        field: "amountLimits",
        message: "Minimum amount cannot be greater than or equal to maximum amount",
        messageVi: "Số tiền tối thiểu không thể lớn hơn hoặc bằng số tiền tối đa",
        severity: "error",
        code: "INVALID_AMOUNT_RANGE",
      });
    }

    if (amountLimits.step <= 0) {
      errors.push({
        field: "amountLimits.step",
        message: "Amount step must be greater than 0",
        messageVi: "Bước tiền phải lớn hơn 0",
        severity: "error",
        code: "INVALID_AMOUNT_STEP",
      });
    }
  }

  /**
   * Validate term options
   */
  private static validateTermOptions(termOptions: any, errors: ValidationError[]): void {
    if (termOptions.min >= termOptions.max) {
      errors.push({
        field: "termOptions",
        message: "Minimum term cannot be greater than or equal to maximum term",
        messageVi: "Thời gian tối thiểu không thể lớn hơn hoặc bằng thời gian tối đa",
        severity: "error",
        code: "INVALID_TERM_RANGE",
      });
    }

    if (termOptions.availableTerms.length === 0) {
      errors.push({
        field: "termOptions.availableTerms",
        message: "At least one available term must be specified",
        messageVi: "Phải chỉ định ít nhất một thời hạn có sẵn",
        severity: "error",
        code: "NO_AVAILABLE_TERMS",
      });
    }
  }

  /**
   * Validate product interest rate
   */
  private static validateProductInterestRate(
    interestRate: any,
    loanType: VietnameseLoanType,
    errors: ValidationError[]
  ): void {
    if (interestRate.annual < 0 || interestRate.annual > 100) {
      errors.push({
        field: "interestRate.annual",
        message: "Annual interest rate must be between 0% and 100%",
        messageVi: "Lãi suất hàng năm phải nằm trong khoảng 0% và 100%",
        severity: "error",
        code: "INVALID_ANNUAL_RATE",
      });
    }

    // Check promotional rate consistency
    if (interestRate.promotional) {
      if (!interestRate.promotional.rate || !interestRate.promotional.duration) {
        errors.push({
          field: "interestRate.promotional",
          message: "Promotional rate must include both rate and duration",
          messageVi: "Lãi suất ưu đãi phải bao gồm cả lãi suất và thời hạn",
          severity: "error",
          code: "INCOMPLETE_PROMOTION",
        });
      }

      if (interestRate.promotional.rate >= interestRate.annual) {
        errors.push({
          field: "interestRate.promotional.rate",
          message: "Promotional rate should be lower than standard rate",
          messageVi: "Lãi suất ưu đãi nên thấp hơn lãi suất tiêu chuẩn",
          severity: "warning",
          code: "PROMOTIONAL_RATE_HIGH",
        });
      }
    }
  }

  /**
   * Validate fee structure
   */
  private static validateFeeStructure(fees: any, errors: ValidationError[]): void {
    if (fees.processingFee && (fees.processingFee < 0 || fees.processingFee > 100)) {
      errors.push({
        field: "fees.processingFee",
        message: "Processing fee percentage must be between 0% and 100%",
        messageVi: "Phí xử lý phần tr phải nằm trong khoảng 0% và 100%",
        severity: "error",
        code: "INVALID_PROCESSING_FEE",
      });
    }

    if (fees.insuranceFee && (fees.insuranceFee < 0 || fees.insuranceFee > 10)) {
      errors.push({
        field: "fees.insuranceFee",
        message: "Insurance fee percentage should not exceed 10%",
        messageVi: "Phí bảo hiểm phần tr không nên vượt quá 10%",
        severity: "warning",
        code: "HIGH_INSURANCE_FEE",
      });
    }
  }

  /**
   * Validate eligibility criteria
   */
  private static validateEligibilityCriteria(eligibility: any, errors: ValidationError[]): void {
    if (eligibility.minAge >= eligibility.maxAgeAtMaturity) {
      errors.push({
        field: "eligibility.ages",
        message: "Minimum age cannot be greater than or equal to maximum age at maturity",
        messageVi: "Tuổi tối thiểu không thể lớn hơn hoặc bằng tuổi tối đa tại thời điểm đáo hạn",
        severity: "error",
        code: "INVALID_AGE_RANGE",
      });
    }

    if (eligibility.minMonthlyIncome <= 0) {
      errors.push({
        field: "eligibility.minMonthlyIncome",
        message: "Minimum monthly income must be greater than 0",
        messageVi: "Thu nhập hàng tháng tối thiểu phải lớn hơn 0",
        severity: "error",
        code: "INVALID_MIN_INCOME",
      });
    }

    if (eligibility.maxLoanToValueRatio && (eligibility.maxLoanToValueRatio < 0 || eligibility.maxLoanToValueRatio > 100)) {
      errors.push({
        field: "eligibility.maxLoanToValueRatio",
        message: "LTV ratio must be between 0% and 100%",
        messageVi: "Tỷ lệ LTV phải nằm trong khoảng 0% và 100%",
        severity: "error",
        code: "INVALID_LTV_RATIO",
      });
    }
  }

  /**
   * Validate SBV compliance
   */
  private static validateSBVCompliance(product: VietnameseLoanProduct, errors: ValidationError[]): void {
    if (!product.regulatoryCompliance.sbvRegistrationNumber) {
      errors.push({
        field: "regulatoryCompliance.sbvRegistrationNumber",
        message: "SBV registration number is required for legal operation",
        messageVi: "Số đăng ký SBV là bắt buộc để hoạt động hợp pháp",
        severity: "error",
        code: "MISSING_SBV_REGISTRATION",
      });
    }

    if (!product.regulatoryCompliance.consumerProtectionCompliance) {
      errors.push({
        field: "regulatoryCompliance.consumerProtectionCompliance",
        message: "Consumer protection compliance must be confirmed",
        messageVi: "Phải xác nhận tuân thủ bảo vệ người tiêu dùng",
        severity: "error",
        code: "MISSING_CONSUMER_PROTECTION",
      });
    }

    if (!product.regulatoryCompliance.disclosureRequirementsMet) {
      errors.push({
        field: "regulatoryCompliance.disclosureRequirementsMet",
        message: "Disclosure requirements must be met",
        messageVi: "Phải đáp ứng các yêu cầu công bố thông tin",
        severity: "error",
        code: "MISSING_DISCLOSURE",
      });
    }
  }
}

export default VietnameseFinancialValidator;