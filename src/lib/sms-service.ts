import "server-only";

interface SmsSendResult {
  success: boolean;
  error?: string;
}

export class SmsService {
  private static readonly API_KEY = process.env.SMS_API_KEY || "";
  private static readonly SENDER = process.env.SMS_SENDER || "";
  private static readonly PATTERN_CODE = process.env.SMS_PATTERN_CODE || "";
  private static readonly PROVIDER = (
    process.env.SMS_PROVIDER || "kavenegar"
  ).toLowerCase();

  static async sendOtpSms(
    phone: string,
    token: string,
  ): Promise<SmsSendResult> {
    if (process.env.NODE_ENV !== "production" || !this.API_KEY) {
      return { success: true };
    }

    try {
      if (this.PROVIDER === "kavenegar") {
        return await this.sendKavenegarLookup(phone, token);
      }

      if (this.PROVIDER === "ippanel" || this.PROVIDER === "farazsms") {
        return await this.sendIpPanelPattern(phone, token);
      }

      return await this.sendGenericSms(phone, token);
    } catch {
      return {
        success: false,
        error: "ارتباط با مرکز ارسال پیامک برقرار نشد.",
      };
    }
  }

  private static async sendKavenegarLookup(
    phone: string,
    token: string,
  ): Promise<SmsSendResult> {
    const template = this.PATTERN_CODE || "verify";
    const url = `https://api.kavenegar.com/v1/${this.API_KEY}/verify/lookup.json?receptor=${phone}&token=${token}&template=${template}`;

    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(6000),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "خطا در استعلام وب‌سرویس کاوه‌نگار." };
    }

    const data = (await response.json()) as { return?: { status?: number } };
    if (data.return?.status === 200) {
      return { success: true };
    }

    return { success: false, error: "عدم تایید ارسال از سمت درگاه پیامک." };
  }

  private static async sendIpPanelPattern(
    phone: string,
    token: string,
  ): Promise<SmsSendResult> {
    const url = "https://api2.ippanel.com/api/v1/sms/pattern/normal/send";
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
      headers: {
        "Content-Type": "application/json",
        apikey: this.API_KEY,
      },
      body: JSON.stringify({
        code: this.PATTERN_CODE,
        sender: this.SENDER || "+983000505",
        recipient: phone,
        variable: {
          code: token,
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: "خطا در ارسال پیامک الگو." };
    }

    return { success: true };
  }

  private static async sendGenericSms(
    phone: string,
    token: string,
  ): Promise<SmsSendResult> {
    const url = "https://api2.ippanel.com/api/v1/sms/send/webservice/single";
    const message = `کد تایید ورود و ثبت سفارش کافه راز: ${token}`;

    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
      headers: {
        "Content-Type": "application/json",
        apikey: this.API_KEY,
      },
      body: JSON.stringify({
        recipient: [phone],
        sender: this.SENDER,
        message,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "خطا در ارسال پیامک مستقیم." };
    }

    return { success: true };
  }
}
