import { MFAResponse, WebAuthnResponse } from "@puyodead1/spacebar-api";

export class MFAError extends Error {
  ticket: string;
  mfa: true;
  sms: false;
  webauthn: string | null = null;

  constructor(data: MFAResponse | WebAuthnResponse) {
    super();
    this.name = "MFAError";
    this.message = "MFA Required";
    this.ticket = data.ticket;
    this.mfa = data.mfa;
    this.sms = data.sms;

    if ("webauthn" in data) {
      this.webauthn = data.webauthn;
    }
  }
}
