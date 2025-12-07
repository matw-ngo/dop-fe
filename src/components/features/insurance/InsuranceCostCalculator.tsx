"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Calculator,
  Car,
  FileText,
  Download,
  Info,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// Vehicle types in Vietnamese
const vehicleTypes = [
  { value: "car", label: "Ô tô con", seatsRange: { min: 4, max: 9 } },
  { value: "truck", label: "Xe tải", seatsRange: { min: 0, max: 0 } },
  { value: "motorcycle", label: "Xe máy", seatsRange: { min: 0, max: 0 } },
  { value: "tractor", label: "Máy kéo", seatsRange: { min: 0, max: 0 } },
  {
    value: "specialized",
    label: "Xe chuyên dùng",
    seatsRange: { min: 0, max: 0 },
  },
];

// Vehicle usage types
const vehicleUsages = [
  { value: "personal", label: "Cá nhân", coefficient: 1.0 },
  { value: "business", label: "Kinh doanh", coefficient: 1.2 },
  { value: "taxi", label: "Taxi", coefficient: 1.5 },
  { value: "training", label: "Dạy lái", coefficient: 1.3 },
];

// Premium rates (simplified for calculation)
const premiumRates = {
  compulsory: {
    car: {
      base: 437000, // VND
      seatRate: 95000, // per seat > 5
    },
    motorcycle: {
      base: 66000,
      seatRate: 0,
    },
    truck: {
      base: 1249000,
      seatRate: 0,
    },
    tractor: {
      base: 358000,
      seatRate: 0,
    },
    specialized: {
      base: 1249000,
      seatRate: 0,
    },
  },
  voluntary: {
    car: {
      base: 5000000,
      seatRate: 500000,
    },
    motorcycle: {
      base: 500000,
      seatRate: 0,
    },
    truck: {
      base: 8000000,
      seatRate: 0,
    },
    tractor: {
      base: 3000000,
      seatRate: 0,
    },
    specialized: {
      base: 10000000,
      seatRate: 0,
    },
  },
};

export default function InsuranceCostCalculator() {
  const t = useTranslations("features.insurance.main");
  const [insuranceType, setInsuranceType] = useState("compulsory");
  const [vehicleType, setVehicleType] = useState("");
  const [seats, setSeats] = useState("");
  const [usage, setUsage] = useState("personal");
  const [vehicleValue, setVehicleValue] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("500000000"); // 500 triệu VND

  // Calculate premium
  const calculation = useMemo(() => {
    if (!vehicleType) return null;

    const rates =
      premiumRates[insuranceType as keyof typeof premiumRates][
        vehicleType as keyof typeof premiumRates.compulsory
      ];
    if (!rates) return null;

    let premium = rates.base;

    // Add seat premium for cars with more than 5 seats
    if (vehicleType === "car" && seats) {
      const seatCount = parseInt(seats);
      if (seatCount > 5) {
        premium += (seatCount - 5) * rates.seatRate;
      }
    }

    // Apply usage coefficient
    const usageCoeff =
      vehicleUsages.find((u) => u.value === usage)?.coefficient || 1;
    premium *= usageCoeff;

    // Calculate tax (10% VAT)
    const tax = premium * 0.1;
    const total = premium + tax;

    return {
      premium: Math.round(premium),
      tax: Math.round(tax),
      total: Math.round(total),
      currency: "VND",
    };
  }, [insuranceType, vehicleType, seats, usage]);

  // Calculate voluntary insurance premium based on vehicle value
  const voluntaryCalculation = useMemo(() => {
    if (insuranceType !== "voluntary" || !vehicleValue) return null;

    const value = parseInt(vehicleValue);
    const rate = 0.015; // 1.5% of vehicle value
    let premium = value * rate;

    // Minimum premium
    const minPremium = 1500000;
    premium = Math.max(premium, minPremium);

    // Apply usage coefficient
    const usageCoeff =
      vehicleUsages.find((u) => u.value === usage)?.coefficient || 1;
    premium *= usageCoeff;

    // Calculate tax
    const tax = premium * 0.1;
    const total = premium + tax;

    return {
      premium: Math.round(premium),
      tax: Math.round(tax),
      total: Math.round(total),
      currency: "VND",
    };
  }, [insuranceType, vehicleValue, usage]);

  const handleReset = () => {
    setInsuranceType("compulsory");
    setVehicleType("");
    setSeats("");
    setUsage("personal");
    setVehicleValue("");
    setCoverageAmount("500000000");
  };

  const handleExportPDF = () => {
    if (!calculation && !voluntaryCalculation) {
      toast.error(t("calculator.export.noData"));
      return;
    }

    const data = calculation || voluntaryCalculation;
    const content = `
Báo giá bảo hiểm ${insuranceType === "compulsory" ? "bắt buộc" : "tự nguyện"}

Loại xe: ${vehicleTypes.find((v) => v.value === vehicleType)?.label}
Số chỗ ngồi: ${seats || "N/A"}
Mục đích sử dụng: ${vehicleUsages.find((u) => u.value === usage)?.label}
${vehicleValue ? `Giá trị xe: ${parseInt(vehicleValue).toLocaleString()} VNĐ` : ""}

Phí bảo hiểm: ${data?.premium.toLocaleString()} VNĐ
Thuế VAT (10%): ${data?.tax.toLocaleString()} VNĐ
Tổng cộng: ${data?.total.toLocaleString()} VNĐ

Ngày tính: ${new Date().toLocaleDateString("vi-VN")}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-gia-bao-hiem-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(t("calculator.export.success"));
  };

  const selectedVehicleType = vehicleTypes.find((v) => v.value === vehicleType);
  const showSeatsInput = vehicleType === "car";
  const showVehicleValue = insuranceType === "voluntary";

  return (
    <div className="bg-muted">
      {/* Page Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("calculator.title")}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("calculator.description")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {t("calculator.form.title")}
                </CardTitle>
                <CardDescription>
                  {t("calculator.form.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Insurance Type */}
                <div className="space-y-2">
                  <Label>{t("calculator.form.insuranceType")}</Label>
                  <RadioGroup
                    value={insuranceType}
                    onValueChange={setInsuranceType}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compulsory" id="compulsory" />
                      <Label htmlFor="compulsory">
                        {t("calculator.form.compulsory")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="voluntary" id="voluntary" />
                      <Label htmlFor="voluntary">
                        {t("calculator.form.voluntary")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">
                    {t("calculator.form.vehicleType")}
                  </Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("calculator.form.selectVehicleType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seats (for cars) */}
                {showSeatsInput && (
                  <div className="space-y-2">
                    <Label htmlFor="seats">{t("calculator.form.seats")}</Label>
                    <Input
                      id="seats"
                      type="number"
                      min={selectedVehicleType?.seatsRange.min}
                      max={selectedVehicleType?.seatsRange.max}
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      placeholder={t("calculator.form.enterSeats")}
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedVehicleType?.label}:{" "}
                      {selectedVehicleType?.seatsRange.min}-
                      {selectedVehicleType?.seatsRange.max}{" "}
                      {t("calculator.form.seats")}
                    </p>
                  </div>
                )}

                {/* Usage Type */}
                <div className="space-y-2">
                  <Label htmlFor="usage">{t("calculator.form.usage")}</Label>
                  <Select value={usage} onValueChange={setUsage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleUsages.map((usageType) => (
                        <SelectItem
                          key={usageType.value}
                          value={usageType.value}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{usageType.label}</span>
                            {usageType.coefficient !== 1 && (
                              <Badge variant="secondary" className="ml-2">
                                x{usageType.coefficient}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Value (for voluntary insurance) */}
                {showVehicleValue && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicleValue">
                      {t("calculator.form.vehicleValue")}
                    </Label>
                    <Input
                      id="vehicleValue"
                      type="number"
                      min="0"
                      step="1000000"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(e.target.value)}
                      placeholder="500000000"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t("calculator.form.vehicleValueNote")}
                    </p>
                  </div>
                )}

                {/* Coverage Amount */}
                {insuranceType === "voluntary" && (
                  <div className="space-y-2">
                    <Label htmlFor="coverage">
                      {t("calculator.form.coverage")}
                    </Label>
                    <Select
                      value={coverageAmount}
                      onValueChange={setCoverageAmount}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100000000">
                          {t("calculator.form.coverageOptions.100M")}
                        </SelectItem>
                        <SelectItem value="500000000">
                          {t("calculator.form.coverageOptions.500M")}
                        </SelectItem>
                        <SelectItem value="1000000000">
                          {t("calculator.form.coverageOptions.1B")}
                        </SelectItem>
                        <SelectItem value="2000000000">
                          {t("calculator.form.coverageOptions.2B")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("calculator.form.reset")}
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={!calculation && !voluntaryCalculation}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t("calculator.form.export")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Calculation Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("calculator.result.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calculation || voluntaryCalculation ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("calculator.result.premium")}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {(
                            (calculation || voluntaryCalculation)?.premium || 0
                          ).toLocaleString()}{" "}
                          VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("calculator.result.tax")}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {(
                            (calculation || voluntaryCalculation)?.tax || 0
                          ).toLocaleString()}{" "}
                          VNĐ
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("calculator.result.total")}
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {(
                          (calculation || voluntaryCalculation)?.total || 0
                        ).toLocaleString()}{" "}
                        VNĐ
                      </p>
                    </div>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>
                        {t("calculator.result.validityTitle")}
                      </AlertTitle>
                      <AlertDescription>
                        {t("calculator.result.validityDesc")}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("calculator.result.noCalculation")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Box */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t("calculator.info.title")}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{t("calculator.info.description")}</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("calculator.info.note1")}</li>
                  <li>{t("calculator.info.note2")}</li>
                  <li>{t("calculator.info.note3")}</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Additional Information */}
        <Tabs defaultValue="fees" className="mt-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fees">{t("calculator.tabs.fees")}</TabsTrigger>
            <TabsTrigger value="regulations">
              {t("calculator.tabs.regulations")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.fees.title")}</CardTitle>
                <CardDescription>
                  {t("calculator.fees.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">
                          {t("calculator.fees.table.vehicle")}
                        </th>
                        <th className="text-left p-2">
                          {t("calculator.fees.table.type")}
                        </th>
                        <th className="text-right p-2">
                          {t("calculator.fees.table.baseFee")}
                        </th>
                        <th className="text-right p-2">
                          {t("calculator.fees.table.additional")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Ô tô con</td>
                        <td className="p-2">Bắt buộc</td>
                        <td className="p-2 text-right">437,000 VNĐ</td>
                        <td className="p-2 text-right">
                          95,000 VNĐ/chỗ &gt; 5
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Xe máy</td>
                        <td className="p-2">Bắt buộc</td>
                        <td className="p-2 text-right">66,000 VNĐ</td>
                        <td className="p-2 text-right">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Xe tải</td>
                        <td className="p-2">Bắt buộc</td>
                        <td className="p-2 text-right">1,249,000 VNĐ</td>
                        <td className="p-2 text-right">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regulations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.regulations.title")}</CardTitle>
                <CardDescription>
                  {t("calculator.regulations.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {t("calculator.regulations.important")}
                    </AlertTitle>
                    <AlertDescription>
                      {t("calculator.regulations.importantDesc")}
                    </AlertDescription>
                  </Alert>
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">
                      {t("calculator.regulations.requirements")}
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("calculator.regulations.req1")}</li>
                      <li>{t("calculator.regulations.req2")}</li>
                      <li>{t("calculator.regulations.req3")}</li>
                      <li>{t("calculator.regulations.req4")}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
