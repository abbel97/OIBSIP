const buildEmailHTML = ({heading, bodyText, ctaText, ctaUrl, expiryText}) => `
    <div style="background-color: #f9f9f9; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f5; overflow: hidden;">
        <tr>
            <td align="center" style="background-color: #e63946; padding: 30px 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Pizza App</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; text-align: left;">
            <h2 style="color: #1d3557; margin: 0 0 16px 0; font-size: 22px; font-weight: 600;">${heading}</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${bodyText}
            </p>
            <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto; text-align: center;">
                <tr>
                <td align="center" bgcolor="#e63946" style="border-radius: 6px;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
                    ${ctaText}
                    </a>
                </td>
                </tr>
            </table>
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0; text-align: center; font-style: italic;">
                ⏳ ${expiryText}
            </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 30px;">
            <hr style="border: 0; border-top: 1px solid #eef2f5; margin: 0;">
            </td>
        </tr>
        <tr>
            <td style="padding: 30px; background-color: #fafbfc; text-align: left;">
            <p style="color: #718096; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
                If the button above does not work, copy and paste this link into your web browser:
            </p>
            <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all;">
                <a href="${ctaUrl}" target="_blank" style="color: #3182ce; text-decoration: underline;">${ctaUrl}</a>
            </p>
            <p style="color: #a0aec0; font-size: 11px; line-height: 1.4; margin: 0; text-align: center;">
                &copy; ${new Date().getFullYear()} Pizza App. All rights reserved.<br>
                If you did not request this, you can safely ignore this automated message.
            </p>
            </td>
        </tr>
        </table>
    </div>
`;

module.exports = {buildEmailHTML};