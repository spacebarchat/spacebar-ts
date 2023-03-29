import { CaptchaRequiredResponse } from "@puyodead1/fosscord-api";

export default class CaptchaError extends Error {
  captcha_key: string;
  captcha_sitekey: string;
  captcha_service: string;
  constructor(data: CaptchaRequiredResponse) {
    super();
    this.name = "CaptchaError";
    this.message = "Captcha Required";
    this.captcha_key = data.captcha_key;
    this.captcha_sitekey = data.captcha_sitekey;
    this.captcha_service = data.captcha_service;
  }
}
