import { randomBytes } from 'crypto';

export function generateOTP(): string {
    // cryptographically strong 6-digit code
    const bytes = randomBytes(4);
    const n = bytes.readUInt32BE(0) % 1_000_000;
    return n.toString().padStart(6, "0");
  }
  
  export function getUserPhoneNumber(attrs: Record<string, any> = {}): string | null {
    return (
      attrs.phone_number ||
      attrs.phoneNumber ||
      attrs.phone ||
      attrs["custom:phone"] ||
      attrs["custom:phoneNumber"] ||
      null
    );
  }
  
  export function isE164(str: string | null | undefined): boolean {
    return /^\+[1-9]\d{1,14}$/.test(str || "");
  }
  
  export async function sendOTPViaWhatsApp(phoneNumber: string, otp: string): Promise<any> {
    const url = process.env.SENDZEN_API_URL;
    const key = process.env.SENDZEN_API_KEY;
    const from = process.env.WHATSAPP_FROM;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
    const langCode = process.env.WHATSAPP_LANG_CODE;
  
    console.log("WhatsApp API Configuration:", {
      url: url ? "SET" : "NOT_SET",
      key: key ? "SET" : "NOT_SET",
      from: from ? "SET" : "NOT_SET",
      templateName: templateName ? "SET" : "NOT_SET",
      langCode: langCode ? "SET" : "NOT_SET",
    });
  
    if (!url || !key || !from || !templateName || !langCode) {
      throw new Error(
        "WhatsApp provider env not set - SENDZEN_API_URL, SENDZEN_API_KEY, WHATSAPP_FROM, WHATSAPP_TEMPLATE_NAME, WHATSAPP_LANG_CODE"
      );
    }
  
    const payload = {
      from,
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        lang_code: langCode,
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    };
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    };
  
    console.log("Sending WhatsApp message to:", phoneNumber);
    console.log("Payload:", JSON.stringify(payload, null, 2));
  
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
  
      console.log("WhatsApp API Response Status:", res.status);
      console.log(
        "WhatsApp API Response Headers:",
        Object.fromEntries(res.headers.entries())
      );
  
      if (!res.ok) {
        let errorDetails;
        try {
          errorDetails = await res.json();
          console.error(
            "WhatsApp API Error Response:",
            JSON.stringify(errorDetails, null, 2)
          );
        } catch (parseError) {
          const text = await res.text();
          errorDetails = {
            statuscode: res.status,
            response: "PARSE_ERROR",
            data: text,
          };
        }
  
        const error = new Error(`WhatsApp send failed - Status: ${res.status}`) as Error & { whatsappError?: any; statusCode?: number };
        error.whatsappError = errorDetails;
        error.statusCode = res.status;
        throw error;
      }
  
      const result = await res.json() as any;
      console.log("WhatsApp send successful");
      console.log("Response:", JSON.stringify(result, null, 2));

      if (result.statuscode && result.statuscode !== 200) {
        const error = new Error(
          `WhatsApp send failed - Status: ${result.statuscode}`
        ) as Error & { whatsappError?: any; statusCode?: number };
        error.whatsappError = result;
        error.statusCode = result.statuscode;
        throw error;
      }
  
      return result;
    } catch (error: any) {
      if (!error.whatsappError) {
        console.error("WhatsApp API Network Error:", error.message);
        const networkError = new Error(
          `WhatsApp API network error: ${error.message}`
        ) as Error & { whatsappError?: any; statusCode?: number };
        networkError.whatsappError = {
          statuscode: 0,
          response: "NETWORK_ERROR",
          data: error.message,
        };
        throw networkError;
      }
      throw error;
    }
  }
  
// Standardized return logger so every return is printed the same way
export function logReturn(tag: string, event: any, extra: any = {}): any {
    try {
      console.log("[RETURN]", tag, {
        userName: event?.userName,
        trigger: event?.triggerSource,
        sessionLen: event?.request?.session?.length ?? 0,
        response: event?.response,
        ...extra,
      });
    } catch (e) {
      console.log("[RETURN] log error", e);
    }
    return event;
  }