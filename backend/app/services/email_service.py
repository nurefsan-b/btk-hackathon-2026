from pathlib import Path
from typing import Any
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import aiosmtplib

from app.config import get_settings

settings = get_settings()

async def send_2fa_email(email: str, code: str) -> None:
    # Create message
    message = MIMEMultipart()
    message["From"] = settings.mail_from
    message["To"] = email
    message["Subject"] = "MicroFon | Güvenlik Doğrulama Kodu"

    html_content = f"""
    <html>
        <body style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; border: 1px solid #ddd;">
                <h2 style="color: #8b5cf6;">MicroFon Güvenlik</h2>
                <p>Hesabınızın güvenliğini doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px; color: #00ff88; margin: 20px 0;">
                    {code}
                </div>
                <p style="font-size: 12px; color: #666;">Bu kod 10 dakika içinde geçerliliğini yitirecektir. Eğer bu işlemi siz yapmadıysanız, lütfen şifrenizi değiştirin.</p>
            </div>
        </body>
    </html>
    """
    message.attach(MIMEText(html_content, "html"))

    # Send email
    await aiosmtplib.send(
        message,
        hostname=settings.mail_server,
        port=settings.mail_port,
        username=settings.mail_username,
        password=settings.mail_password,
        use_tls=settings.mail_ssl_tls,
        start_tls=settings.mail_starttls,
    )
