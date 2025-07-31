"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPTemplate = void 0;
const config_1 = require("../../../config");
const OTPTemplate = (otp) => {
    return (`<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>OTP Verification</title>
    <style>
      @media only screen and (max-width: 620px) {
        .wrapper {
          width: 100% !important;
          padding: 20px !important;
        }

        .content {
          font-size: 16px !important;
        }

        .otp-box {
          font-size: 28px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #f4f4f4; padding: 40px 0"
    >
      <tr>
        <td align="center">
          <table
            class="wrapper"
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="600"
            style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
          >
            <tr>
              <td
                align="center"
                style="padding: 30px 40px; background-color: #076db3;"
              >
                <h1
                  style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;"
                >
                  OTP Verification
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px;">
                <p style="margin: 0 0 16px 0; font-size: 18px; color: #333333;">
                  Hello,
                </p>
                <p class="content" style="margin: 0 0 24px 0; font-size: 16px; color: #555555; line-height: 1.5;">
                  You requested a one-time password (OTP) to proceed with your action. Please use the following OTP:
                </p>
                <div
                  class="otp-box"
                  style="
                    font-size: 32px;
                    font-weight: bold;
                    color: #076db3;
                    background: #f0f7fc;
                    padding: 16px;
                    text-align: center;
                    border-radius: 6px;
                    letter-spacing: 6px;
                    margin-bottom: 24px;
                  "
                >
                  ${otp}
                </div>
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #555555;">
                  This OTP will expire in <strong>5 minutes</strong>.
                </p>
                <p style="margin: 0 0 0 0; font-size: 16px; color: #999999;">
                  If you did not request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px; background-color: #fafafa;">
                <p style="margin: 0; font-size: 13px; color: #999999;">
                  &copy; ${new Date().getFullYear()} ${config_1.config.companyName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`);
};
exports.OTPTemplate = OTPTemplate;
//# sourceMappingURL=otp.template.js.map