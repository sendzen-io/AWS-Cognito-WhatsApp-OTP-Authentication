import { DescribeUserPoolClientCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "./cognitoClient";

export type ClientRole = "SIGNUP" | "LOGIN" | "UNKNOWN";

const clientRoleCache = new Map<string, ClientRole>();

/**
 * Resolve clientId -> "SIGNUP" | "LOGIN" | "UNKNOWN" by inspecting ClientName.
 * Results are cached per Lambda container for warm invocations.
 */
export async function getClientRole(userPoolId: string, clientId?: string | null): Promise<ClientRole> {
  if (!clientId) return "UNKNOWN";

  const cached = clientRoleCache.get(clientId);
  if (cached) return cached;

  try {
    const res = await cognitoClient.send(
      new DescribeUserPoolClientCommand({ UserPoolId: userPoolId, ClientId: clientId })
    );
    const name = (res.UserPoolClient?.ClientName || "").toLowerCase();

    const role: ClientRole =
      name.includes("signup") ? "SIGNUP" :
      name.includes("login")  ? "LOGIN"  :
      "UNKNOWN";

    clientRoleCache.set(clientId, role);
    return role;
  } catch (e) {
    console.error("DescribeUserPoolClient failed:", e);
    return "UNKNOWN";
  }
}
