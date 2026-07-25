# Troubleshooting Guide

Solutions to common issues during setup and run.

---

## 1. Port Collisions
* **Problem**: Uvicorn or Streamlit fails to start due to `Address already in use` error.
* **Solution**: Find and kill the blocking processes:
  ```bash
  # Check backend port 8000
  lsof -i :8000
  kill -9 <PID>

  # Check frontend port 8501
  lsof -i :8501
  kill -9 <PID>
  ```

---

## 2. OTP Delivery Fails
* **Problem**: Email OTP doesn't deliver, displaying `NETWORK_ERROR` or `AUTH_ERROR` on screen.
* **Solution**:
  1. Ensure `SMTP_HOST` in `.env` is set to `smtp.gmail.com`, not the email address.
  2. Verify you generated a 16-character **App Password** from Google Accounts security settings (regular password will fail).
  3. Ensure port `587` is open and not blocked by local system VPNs/Firewalls.

---

## 3. Database Locked Error
* **Problem**: SQLite throws a `database is locked` error.
* **Solution**: Check if another instance of the Streamlit app is running and holding a connection open. If the lock persists, close all terminal run tasks and delete the temporary SQLite lock files.
