// @ts-nocheck
/**
 * Security Test Runner
 * Comprehensive security testing suite for OTP verification system
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface TestResult {
  suite: string;
  tests: number;
  passed: number;
  failed: number;
  coverage: number;
  duration: number;
  securityIssues: string[];
}

interface SecurityReport {
  timestamp: string;
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    overallCoverage: number;
    totalDuration: number;
  };
  results: TestResult[];
  securityRecommendations: string[];
  complianceStatus: {
    vietnamRegulations: boolean;
    dataProtection: boolean;
    rateLimiting: boolean;
    csrfProtection: boolean;
    sessionSecurity: boolean;
  };
}

class SecurityTestRunner {
  private results: TestResult[] = [];
  private securityIssues: string[] = [];

  async runAllTests(): Promise<SecurityReport> {
    console.log("🔒 Starting Comprehensive Security Testing...\n");

    const startTime = Date.now();

    // Run individual test suites
    await this.runRateLimitingTests();
    await this.runDeviceFingerprintingTests();
    await this.runSessionSecurityTests();
    await this.runCSRFProtectionTests();
    await this.runInputSanitizationTests();
    await this.runVietnameseComplianceTests();
    await this.runIntegrationTests();

    const duration = Date.now() - startTime;

    // Generate comprehensive report
    const report: SecurityReport = this.generateReport(duration);

    // Save report to file
    await this.saveReport(report);

    // Print summary
    this.printSummary(report);

    return report;
  }

  private async runRateLimitingTests(): Promise<void> {
    console.log("🚦 Testing Rate Limiting Security...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=rate-limiting --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Rate Limiting", result);
    } catch (error: any) {
      this.securityIssues.push("Rate limiting tests failed");
      this.addTestResult("Rate Limiting", 0, 0, 1, 0);
    }
  }

  private async runDeviceFingerprintingTests(): Promise<void> {
    console.log("👆 Testing Device Fingerprinting Security...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=device-fingerprinting --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Device Fingerprinting", result);
    } catch (error: any) {
      this.securityIssues.push("Device fingerprinting tests failed");
      this.addTestResult("Device Fingerprinting", 0, 0, 1, 0);
    }
  }

  private async runSessionSecurityTests(): Promise<void> {
    console.log("🔐 Testing Session Management Security...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=session-management --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Session Management", result);
    } catch (error: any) {
      this.securityIssues.push("Session security tests failed");
      this.addTestResult("Session Management", 0, 0, 1, 0);
    }
  }

  private async runCSRFProtectionTests(): Promise<void> {
    console.log("🛡️ Testing CSRF Protection...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=csrf-protection --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("CSRF Protection", result);
    } catch (error: any) {
      this.securityIssues.push("CSRF protection tests failed");
      this.addTestResult("CSRF Protection", 0, 0, 1, 0);
    }
  }

  private async runInputSanitizationTests(): Promise<void> {
    console.log("🧹 Testing Input Sanitization...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=input-sanitization --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Input Sanitization", result);
    } catch (error: any) {
      this.securityIssues.push("Input sanitization tests failed");
      this.addTestResult("Input Sanitization", 0, 0, 1, 0);
    }
  }

  private async runVietnameseComplianceTests(): Promise<void> {
    console.log("🇻🇳 Testing Vietnamese Market Compliance...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=vietnamese-compliance --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Vietnamese Compliance", result);
    } catch (error: any) {
      this.securityIssues.push("Vietnamese compliance tests failed");
      this.addTestResult("Vietnamese Compliance", 0, 0, 1, 0);
    }
  }

  private async runIntegrationTests(): Promise<void> {
    console.log("🔗 Running Security Integration Tests...");

    try {
      const result = execSync(
        "npm test -- --testPathPattern=otp-security --verbose",
        {
          encoding: "utf8",
          cwd: process.cwd(),
        },
      );

      this.parseTestResult("Security Integration", result);
    } catch (error: any) {
      this.securityIssues.push("Security integration tests failed");
      this.addTestResult("Security Integration", 0, 0, 1, 0);
    }
  }

  private parseTestResult(suite: string, output: string): void {
    // Parse Jest output to extract test metrics
    const lines = output.split("\n");

    let tests = 0;
    let passed = 0;
    let failed = 0;

    for (const line of lines) {
      if (line.includes("Tests:")) {
        const match = line.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed/);
        if (match) {
          passed = parseInt(match[1]);
          failed = parseInt(match[2]);
          tests = passed + failed;
        }
      }
    }

    this.addTestResult(suite, tests, passed, failed, 0);
  }

  private addTestResult(
    suite: string,
    tests: number,
    passed: number,
    failed: number,
    coverage: number,
  ): void {
    this.results.push({
      suite,
      tests,
      passed,
      failed,
      coverage,
      duration: 0, // Would be calculated from actual test execution
    });
  }

  private generateReport(duration: number): SecurityReport {
    const totalTests = this.results.reduce((sum, r) => sum + r.tests, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const overallCoverage =
      this.results.reduce((sum, r) => sum + r.coverage, 0) /
      this.results.length;

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        overallCoverage,
        totalDuration: duration,
      },
      results: this.results,
      securityRecommendations: this.generateSecurityRecommendations(),
      complianceStatus: this.assessComplianceStatus(),
    };
  }

  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.securityIssues.length > 0) {
      recommendations.push(
        "🚨 Critical: Fix failing security tests immediately",
      );
    }

    const rateLimitingResult = this.results.find(
      (r) => r.suite === "Rate Limiting",
    );
    if (rateLimitingResult && rateLimitingResult.failed > 0) {
      recommendations.push(
        "🔒 Implement proper rate limiting to prevent abuse",
      );
    }

    const sessionResult = this.results.find(
      (r) => r.suite === "Session Management",
    );
    if (sessionResult && sessionResult.failed > 0) {
      recommendations.push(
        "🔐 Strengthen session management and cookie security",
      );
    }

    const sanitizationResult = this.results.find(
      (r) => r.suite === "Input Sanitization",
    );
    if (sanitizationResult && sanitizationResult.failed > 0) {
      recommendations.push(
        "🧹 Enhance input sanitization to prevent XSS and injection attacks",
      );
    }

    const complianceResult = this.results.find(
      (r) => r.suite === "Vietnamese Compliance",
    );
    if (complianceResult && complianceResult.failed > 0) {
      recommendations.push("🇻🇳 Ensure Vietnamese market regulatory compliance");
    }

    // Add general security recommendations
    recommendations.push(
      "📊 Regularly review and update security configurations",
    );
    recommendations.push(
      "🔄 Implement automated security scanning in CI/CD pipeline",
    );
    recommendations.push(
      "📝 Maintain security audit logs for compliance requirements",
    );
    recommendations.push("🎯 Conduct periodic penetration testing");

    return recommendations;
  }

  private assessComplianceStatus(): SecurityReport["complianceStatus"] {
    return {
      vietnamRegulations:
        this.results.find((r) => r.suite === "Vietnamese Compliance")
          ?.failed === 0,
      dataProtection:
        this.results.find((r) => r.suite === "Input Sanitization")?.failed ===
        0,
      rateLimiting:
        this.results.find((r) => r.suite === "Rate Limiting")?.failed === 0,
      csrfProtection:
        this.results.find((r) => r.suite === "CSRF Protection")?.failed === 0,
      sessionSecurity:
        this.results.find((r) => r.suite === "Session Management")?.failed ===
        0,
    };
  }

  private async saveReport(report: SecurityReport): Promise<void> {
    const reportPath = path.join(process.cwd(), "security-report.json");

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Security report saved to: ${reportPath}`);
    } catch (error) {
      console.error("❌ Failed to save security report:", error);
    }
  }

  private printSummary(report: SecurityReport): void {
    console.log("\n" + "=".repeat(60));
    console.log("🔒 SECURITY TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.totalPassed}`);
    console.log(`❌ Failed: ${report.summary.totalFailed}`);
    console.log(`📈 Coverage: ${report.summary.overallCoverage.toFixed(1)}%`);
    console.log(
      `⏱️ Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`,
    );

    console.log("\n📋 Test Results by Suite:");
    report.results.forEach((result) => {
      const status = result.failed === 0 ? "✅" : "❌";
      console.log(
        `${status} ${result.suite}: ${result.passed}/${result.tests} passed`,
      );
    });

    console.log("\n🛡️ Compliance Status:");
    Object.entries(report.complianceStatus).forEach(([key, value]) => {
      const status = value ? "✅" : "❌";
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      console.log(
        `${status} ${label}: ${value ? "Compliant" : "Non-Compliant"}`,
      );
    });

    if (this.securityIssues.length > 0) {
      console.log("\n🚨 Security Issues:");
      this.securityIssues.forEach((issue) => {
        console.log(`  • ${issue}`);
      });
    }

    console.log("\n💡 Security Recommendations:");
    report.securityRecommendations.forEach((rec) => {
      console.log(`  ${rec}`);
    });

    console.log("\n" + "=".repeat(60));
  }
}

// CLI interface
if (require.main === module) {
  const testRunner = new SecurityTestRunner();

  testRunner
    .runAllTests()
    .then((report) => {
      const allPassed = report.summary.totalFailed === 0;
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error("Security test runner failed:", error);
      process.exit(1);
    });
}

export { SecurityTestRunner, SecurityReport };
export default SecurityTestRunner;
