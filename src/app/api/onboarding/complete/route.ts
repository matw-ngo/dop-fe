import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📥 Received onboarding data:", body);

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validate required fields
    const basicInfo = body["basic-info"];
    const ekycInfo = body["ekyc-verification"];

    if (!basicInfo?.fullName || !basicInfo?.email || !basicInfo?.phone) {
      return NextResponse.json(
        { error: "Missing required basic information" },
        { status: 400 },
      );
    }

    if (!ekycInfo?.ekycVerification?.completed) {
      return NextResponse.json(
        { error: "eKYC verification not completed" },
        { status: 400 },
      );
    }

    // Simulate successful response
    const userId = `USER_${Date.now()}`;
    const applicationId = `APP_${Math.random().toString(36).substring(7).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        userId,
        applicationId,
        status: "pending_review",
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: "24-48 hours",
        email: basicInfo.email,
        phone: basicInfo.phone,
        ekycSessionId: ekycInfo.ekycVerification.sessionId,
      },
    });
  } catch (error) {
    console.error("❌ Error processing onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
