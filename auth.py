"""
auth.py — VidyGuide Authentication
- Anyone can register with ANY email (Gmail, Yahoo, Outlook, college, etc.)
- OTP is sent to their email for verification (6-digit code, 10 min expiry)
- SMTP_USER is just the sender address — has nothing to do with who can log in
"""

import sqlite3
import hashlib
import os
import secrets
import smtplib
import random
import time
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DB_PATH      = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vidyguide.db")
SMTP_HOST    = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT    = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER    = os.getenv("SMTP_USER", "")   # YOUR sender Gmail — not the user's email
SMTP_PASS    = os.getenv("SMTP_PASS", "")   # YOUR Gmail App Password
EMAIL_ENABLED = bool(SMTP_USER and SMTP_PASS)

OTP_EXPIRY_SECONDS = 600   # 10 minutes


# ─────────────────────────────────────────────────────────────────────────────
#  DATABASE
# ─────────────────────────────────────────────────────────────────────────────
def _conn():
    c = sqlite3.connect(DB_PATH, check_same_thread=False)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c


def init_db():
    db = _conn()

    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT UNIQUE NOT NULL,
            email           TEXT UNIQUE NOT NULL,
            password_hash   TEXT NOT NULL,
            full_name       TEXT DEFAULT '',
            is_verified     INTEGER DEFAULT 0,
            otp_code        TEXT DEFAULT NULL,
            otp_expires_at  REAL DEFAULT NULL,
            otp_purpose     TEXT DEFAULT NULL,   -- 'register' | 'reset'
            created_at      REAL DEFAULT (strftime('%s','now')),
            last_login      REAL DEFAULT NULL
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            title       TEXT NOT NULL,
            payload     TEXT DEFAULT '',
            result      TEXT DEFAULT '',
            created_at  REAL DEFAULT (strftime('%s','now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # Safe migration: add columns that may not exist in older DBs
    for col, defn in [
        ("is_verified",    "INTEGER DEFAULT 0"),
        ("otp_code",       "TEXT DEFAULT NULL"),
        ("otp_expires_at", "REAL DEFAULT NULL"),
        ("otp_purpose",    "TEXT DEFAULT NULL"),
        ("last_login",     "REAL DEFAULT NULL"),
    ]:
        try:
            db.execute(f"ALTER TABLE users ADD COLUMN {col} {defn}")
        except Exception:
            pass

    db.commit()
    db.close()


def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()


def _generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


# ─────────────────────────────────────────────────────────────────────────────
#  EMAIL SENDER  (SMTP_USER is YOUR app email, not the user's)
# ─────────────────────────────────────────────────────────────────────────────
def _diagnose_email_error(e: Exception) -> str:
    """Return a clear, actionable message for any email error."""
    msg = str(e).lower()

    # DNS / network unreachable — most common in local/restricted environments
    if any(x in msg for x in ["nodename nor servname", "name or service not known",
                               "errno 8", "getaddrinfo", "network is unreachable",
                               "connection refused", "timed out", "errno 111"]):
        return (
            "NETWORK_ERROR: Your machine cannot reach smtp.gmail.com. "
            "Possible causes:\n"
            "  1. No internet connection\n"
            "  2. Firewall / VPN is blocking port 587\n"
            "  3. Running in a restricted environment (e.g. corporate network)\n\n"
            "Fix options:\n"
            "  • Connect to a normal internet connection\n"
            "  • Try a mobile hotspot\n"
            "  • Or run without email — OTP will be shown on screen (dev mode)"
        )

    if "authentication" in msg or "username and password" in msg or "535" in msg:
        return (
            "AUTH_ERROR: Gmail rejected the login.\n"
            "  1. Make sure you used a Gmail APP PASSWORD (not your normal password)\n"
            "  2. Go to: myaccount.google.com → Security → App Passwords\n"
            "  3. Generate a new 16-char app password and paste it in .env as SMTP_PASS"
        )

    if "recipient" in msg or "550" in msg or "551" in msg:
        return f"RECIPIENT_ERROR: Could not deliver to the address. Check it is a valid email."

    if "ssl" in msg or "tls" in msg:
        return "SSL_ERROR: TLS handshake failed. Try setting SMTP_PORT=465 and SMTP_SSL=true in .env"

    return f"EMAIL_ERROR: {str(e)}"


def _send_email(to_addr: str, subject: str, html: str) -> tuple[bool, str]:
    """
    Send an OTP email FROM your SMTP_USER TO the user's email (any provider).
    Returns (success, message).
    On any failure returns a clear diagnosis — never raises an exception.
    """
    if not EMAIL_ENABLED:
        return False, "NOT_CONFIGURED"

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"VidyGuide <{SMTP_USER}>"
        msg["To"]      = to_addr
        msg.attach(MIMEText(html, "html"))

        # Try STARTTLS on port 587 first (standard Gmail)
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, to_addr, msg.as_string())
            return True, "sent"

        except (OSError, smtplib.SMTPConnectError) as e:
            # Fallback: try SSL on port 465
            if SMTP_PORT == 587:
                try:
                    with smtplib.SMTP_SSL(SMTP_HOST, 465, timeout=10) as server:
                        server.ehlo()
                        server.login(SMTP_USER, SMTP_PASS)
                        server.sendmail(SMTP_USER, to_addr, msg.as_string())
                    return True, "sent"
                except Exception:
                    pass  # fall through to diagnosis below
            raise e  # re-raise original for diagnosis

    except smtplib.SMTPAuthenticationError as e:
        return False, _diagnose_email_error(e)
    except Exception as e:
        return False, _diagnose_email_error(e)


def _otp_email_html(name: str, otp: str, purpose: str = "verify") -> str:
    action = "verify your email address" if purpose == "register" else "reset your password"
    heading = "Email Verification OTP" if purpose == "register" else "Password Reset OTP"
    note = "Enter this code to complete your registration." if purpose == "register" else "Enter this code to reset your password."
    return f"""
<div style="font-family:Arial,sans-serif;background:#0D1117;color:#E2E8F0;padding:40px;
            max-width:480px;margin:auto;border-radius:16px;border:1px solid #2A3550">

  <div style="color:#3DDC84;font-size:1.7rem;font-weight:700;margin-bottom:4px">🌿 VidyGuide</div>
  <div style="color:#7A8BA0;font-size:.85rem;margin-bottom:28px">AI-Powered Career Platform</div>

  <h2 style="color:#E2E8F0;margin-bottom:8px">{heading} 🔐</h2>
  <p style="color:#B0BEC5;line-height:1.7">Hi <strong>{name}</strong>, here is your OTP to {action}.</p>

  <div style="background:#161B27;border:2px dashed #3DDC84;border-radius:12px;
              padding:24px;text-align:center;margin:28px 0">
    <div style="color:#7A8BA0;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">
      Your One-Time Password
    </div>
    <div style="font-size:2.8rem;font-weight:700;letter-spacing:.3em;color:#3DDC84;
                font-family:'Courier New',monospace">
      {otp}
    </div>
    <div style="color:#7A8BA0;font-size:.78rem;margin-top:10px">
      ⏱ Valid for <strong style="color:#F0A500">10 minutes</strong>
    </div>
  </div>

  <p style="color:#B0BEC5;font-size:.88rem">{note}</p>
  <p style="color:#3A4A5E;font-size:.78rem;margin-top:20px;line-height:1.6">
    If you didn't request this, you can safely ignore this email.<br>
    <strong>Never share this OTP with anyone.</strong>
  </p>

  <hr style="border-color:#2A3550;margin:24px 0">
  <div style="color:#3A4A5E;font-size:.75rem">VidyGuide — Always free for students 🌿</div>
</div>"""


# ─────────────────────────────────────────────────────────────────────────────
#  OTP OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────
def _store_otp(user_id: int, otp: str, purpose: str):
    """Save OTP with expiry to DB."""
    db = _conn()
    db.execute(
        "UPDATE users SET otp_code=?, otp_expires_at=?, otp_purpose=? WHERE id=?",
        (otp, time.time() + OTP_EXPIRY_SECONDS, purpose, user_id)
    )
    db.commit()
    db.close()


def _verify_otp(user_id: int, entered_otp: str, purpose: str) -> tuple[bool, str]:
    """Check if entered OTP matches and hasn't expired."""
    db   = _conn()
    user = db.execute(
        "SELECT otp_code, otp_expires_at, otp_purpose FROM users WHERE id=?", (user_id,)
    ).fetchone()
    db.close()

    if not user:
        return False, "User not found."
    if not user["otp_code"]:
        return False, "No OTP was sent. Please request a new one."
    if user["otp_purpose"] != purpose:
        return False, "Invalid OTP type."
    if time.time() > user["otp_expires_at"]:
        return False, "OTP has expired. Please request a new one."
    if user["otp_code"] != entered_otp.strip():
        return False, "Incorrect OTP. Please try again."

    # Clear OTP after successful verification
    db = _conn()
    db.execute(
        "UPDATE users SET otp_code=NULL, otp_expires_at=NULL, otp_purpose=NULL WHERE id=?",
        (user_id,)
    )
    db.commit()
    db.close()
    return True, "OTP verified."


def _otp_remaining_seconds(user_id: int) -> int:
    """Return seconds left on the current OTP (for countdown display)."""
    db   = _conn()
    user = db.execute("SELECT otp_expires_at FROM users WHERE id=?", (user_id,)).fetchone()
    db.close()
    if not user or not user["otp_expires_at"]:
        return 0
    remaining = int(user["otp_expires_at"] - time.time())
    return max(0, remaining)


# ─────────────────────────────────────────────────────────────────────────────
#  REGISTER  (step 1 — creates unverified account + sends OTP)
# ─────────────────────────────────────────────────────────────────────────────
def register_user(username: str, email: str, password: str, full_name: str = "") -> tuple[bool, str, int | None]:
    """
    Returns (success, message, user_id).
    user_id is needed to proceed to OTP verification step.
    Anyone with any email can register — Gmail, Yahoo, Outlook, college, etc.
    """
    username  = username.strip().lower()
    email     = email.strip().lower()
    full_name = full_name.strip()

    if len(username) < 3 or not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username must be 3+ chars, letters/numbers/underscore only.", None
    if len(password) < 6:
        return False, "Password must be at least 6 characters.", None
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return False, "Please enter a valid email address.", None

    try:
        db = _conn()
        db.execute(
            "INSERT INTO users (username, email, password_hash, full_name, is_verified) VALUES (?,?,?,?,0)",
            (username, email, _hash(password), full_name)
        )
        db.commit()
        user_id = db.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()["id"]
        db.close()
    except sqlite3.IntegrityError as e:
        if "username" in str(e): return False, "Username already taken. Choose another.", None
        if "email"    in str(e): return False, "Email already registered. Try logging in.", None
        return False, "Registration failed. Please try again.", None

    # Generate and send OTP to the user's own email
    otp = _generate_otp()
    _store_otp(user_id, otp, "register")

    if EMAIL_ENABLED:
        ok, send_msg = _send_email(
            email,
            "Your VidyGuide Verification OTP",
            _otp_email_html(full_name or username, otp, "register")
        )
        if ok:
            # Email delivered — OTP is in inbox, don't show it on screen
            return True, "OTP_SENT:" + email, user_id
        else:
            # Email failed (network/firewall) — show OTP on screen so user isn't blocked
            print("[EMAIL FAILED] OTP for " + email + " => " + otp + " | Reason: " + send_msg)
            return True, "OTP_SCREEN:" + otp + ":" + send_msg, user_id
    else:
        # .env not configured — dev mode, show OTP on screen
        print("[DEV MODE] OTP for " + email + " => " + otp)
        return True, "OTP_SCREEN:" + otp + ":Email not configured in .env (add SMTP_USER + SMTP_PASS)", user_id


# ─────────────────────────────────────────────────────────────────────────────
#  VERIFY OTP — step 2 after register
# ─────────────────────────────────────────────────────────────────────────────
def verify_registration_otp(user_id: int, otp: str) -> tuple[bool, str]:
    """Verify the OTP entered after registration."""
    ok, msg = _verify_otp(user_id, otp, "register")
    if not ok:
        return False, msg
    db = _conn()
    db.execute("UPDATE users SET is_verified=1 WHERE id=?", (user_id,))
    db.commit()
    db.close()
    return True, "Email verified! You can now log in."


def resend_registration_otp(user_id: int) -> tuple[bool, str]:
    """Resend OTP for registration verification."""
    db   = _conn()
    user = db.execute("SELECT email, full_name, username FROM users WHERE id=?", (user_id,)).fetchone()
    db.close()
    if not user:
        return False, "User not found."
    otp = _generate_otp()
    _store_otp(user_id, otp, "register")
    if EMAIL_ENABLED:
        ok, send_msg = _send_email(
            user["email"],
            "Your VidyGuide Verification OTP",
            _otp_email_html(user["full_name"] or user["username"], otp, "register")
        )
        if ok:
            return True, "OTP_SENT:" + user["email"]
        else:
            print("[EMAIL FAILED] Resend OTP for " + user["email"] + " => " + otp)
            return True, "OTP_SCREEN:" + otp + ":" + send_msg
    else:
        print("[DEV MODE] Resend OTP for " + user["email"] + " => " + otp)
        return True, "OTP_SCREEN:" + otp + ":Email not configured in .env"


# ─────────────────────────────────────────────────────────────────────────────
#  LOGIN
# ─────────────────────────────────────────────────────────────────────────────
def login_user(username_or_email: str, password: str) -> tuple[dict | None, str]:
    """
    Any registered + verified user can log in regardless of email provider.
    Returns (user_dict, status).
    status: 'ok' | 'verify_needed' | error message
    """
    val = username_or_email.strip().lower()
    db  = _conn()
    user = db.execute(
        "SELECT * FROM users WHERE (username=? OR email=?) AND password_hash=?",
        (val, val, _hash(password))
    ).fetchone()
    db.close()

    if not user:
        return None, "Invalid username/email or password."

    user = dict(user)
    if not user.get("is_verified", 0):
        return None, "verify_needed"   # UI will show OTP entry for this user

    db = _conn()
    db.execute("UPDATE users SET last_login=? WHERE id=?", (time.time(), user["id"]))
    db.commit()
    db.close()
    return user, "ok"


def get_user_by_email(email: str) -> dict | None:
    db   = _conn()
    user = db.execute("SELECT * FROM users WHERE email=?", (email.strip().lower(),)).fetchone()
    db.close()
    return dict(user) if user else None


# ─────────────────────────────────────────────────────────────────────────────
#  PASSWORD RESET via OTP
# ─────────────────────────────────────────────────────────────────────────────
def request_password_reset_otp(email: str) -> tuple[bool, str, int | None]:
    """Send OTP for password reset to any email. Returns (ok, message, user_id)."""
    email = email.strip().lower()
    db    = _conn()
    user  = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    db.close()
    if not user:
        return False, "No account found with this email.", None
    user = dict(user)

    otp = _generate_otp()
    _store_otp(user["id"], otp, "reset")

    if EMAIL_ENABLED:
        ok, send_msg = _send_email(
            email,
            "Your VidyGuide Password Reset OTP",
            _otp_email_html(user["full_name"] or user["username"], otp, "reset")
        )
        if ok:
            return True, "OTP_SENT:" + email, user["id"]
        else:
            print("[EMAIL FAILED] Reset OTP for " + email + " => " + otp)
            return True, "OTP_SCREEN:" + otp + ":" + send_msg, user["id"]
    else:
        print("[DEV MODE] Reset OTP for " + email + " => " + otp)
        return True, "OTP_SCREEN:" + otp + ":Email not configured in .env", user["id"]


def verify_reset_otp_and_change(user_id: int, otp: str, new_password: str) -> tuple[bool, str]:
    """Verify reset OTP and immediately set the new password."""
    if len(new_password) < 6:
        return False, "Password must be at least 6 characters."
    ok, msg = _verify_otp(user_id, otp, "reset")
    if not ok:
        return False, msg
    db = _conn()
    db.execute("UPDATE users SET password_hash=? WHERE id=?", (_hash(new_password), user_id))
    db.commit()
    db.close()
    return True, "Password reset successfully! You can now log in."


# ─────────────────────────────────────────────────────────────────────────────
#  HISTORY  (guest-safe: all functions handle user_id=None)
# ─────────────────────────────────────────────────────────────────────────────
def save_history(user_id, action_type: str, title: str, payload: str = "", result: str = ""):
    if not user_id:
        return
    try:
        db = _conn()
        db.execute(
            "INSERT INTO history (user_id,action_type,title,payload,result) VALUES(?,?,?,?,?)",
            (int(user_id), action_type, title[:200], str(payload)[:4000], str(result)[:4000])
        )
        db.commit()
        db.close()
    except Exception:
        pass


def get_user_history(user_id, action_type: str = None, limit: int = 30) -> list[dict]:
    if not user_id:
        return []
    try:
        db = _conn()
        q, p = "SELECT * FROM history WHERE user_id=?", [int(user_id)]
        if action_type:
            q += " AND action_type=?"; p.append(action_type)
        q += " ORDER BY created_at DESC LIMIT ?"; p.append(limit)
        rows = db.execute(q, p).fetchall()
        db.close()
        return [dict(r) for r in rows]
    except Exception:
        return []


def delete_history_item(item_id: int, user_id):
    if not user_id:
        return
    try:
        db = _conn()
        db.execute("DELETE FROM history WHERE id=? AND user_id=?", (int(item_id), int(user_id)))
        db.commit()
        db.close()
    except Exception:
        pass


def clear_all_history(user_id):
    if not user_id:
        return
    try:
        db = _conn()
        db.execute("DELETE FROM history WHERE user_id=?", (int(user_id),))
        db.commit()
        db.close()
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────────────────
#  DASHBOARD STATS
# ─────────────────────────────────────────────────────────────────────────────
def get_dashboard_stats(user_id) -> dict:
    if not user_id:
        return {}
    try:
        db     = _conn()
        counts = {r["action_type"]: r["cnt"] for r in db.execute(
            "SELECT action_type, COUNT(*) as cnt FROM history WHERE user_id=? GROUP BY action_type",
            (int(user_id),)
        ).fetchall()}
        recent = [dict(r) for r in db.execute(
            "SELECT action_type, title, created_at FROM history WHERE user_id=? ORDER BY created_at DESC LIMIT 5",
            (int(user_id),)
        ).fetchall()]
        user   = dict(db.execute("SELECT * FROM users WHERE id=?", (int(user_id),)).fetchone() or {})
        db.close()
        return {
            "total":        sum(counts.values()),
            "career":       counts.get("career",   0),
            "resume":       counts.get("resume",   0),
            "analysis":     counts.get("analysis", 0),
            "mentor":       counts.get("mentor",   0),
            "recent":       recent,
            "member_since": user.get("created_at"),
            "last_login":   user.get("last_login"),
            "display_name": user.get("full_name") or user.get("username", ""),
            "email":        user.get("email", ""),
            "is_verified":  user.get("is_verified", 0),
        }
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────────────
#  PROFILE UPDATE
# ─────────────────────────────────────────────────────────────────────────────
def update_profile(user_id, full_name: str = None, new_password: str = None) -> tuple[bool, str | dict]:
    if not user_id:
        return False, "Not logged in."
    try:
        db = _conn()
        if full_name is not None:
            db.execute("UPDATE users SET full_name=? WHERE id=?", (full_name.strip(), int(user_id)))
        if new_password:
            if len(new_password) < 6:
                db.close()
                return False, "Password must be at least 6 characters."
            db.execute("UPDATE users SET password_hash=? WHERE id=?", (_hash(new_password), int(user_id)))
        db.commit()
        user = dict(db.execute("SELECT * FROM users WHERE id=?", (int(user_id),)).fetchone() or {})
        db.close()
        return True, user
    except Exception as e:
        return False, str(e)


# ─────────────────────────────────────────────────────────────────────────────
#  OTP COUNTDOWN HELPER  (for UI)
# ─────────────────────────────────────────────────────────────────────────────
def otp_remaining(user_id: int) -> int:
    return _otp_remaining_seconds(user_id)


init_db()