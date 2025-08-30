
# 🚀 FastAPI Project Setup Guide

This README provides step-by-step instructions to set up and run a FastAPI application using a virtual environment and essential dependencies.

---

## 📦 Requirements

- Python 3.7+
- PowerShell (for Windows users)
- Git (optional, for version control)

---

## 🛠️ Setup Instructions

### 1. Create a Virtual Environment

```bash
python -m venv .venv
```

### 2. Activate the Virtual Environment (PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

> 💡 If you're using a different shell (e.g., Command Prompt or Bash), activation commands will differ.

### 3. Install Core Dependencies

```bash
pip install fastapi uvicorn python-jose passlib[bcrypt]
```

### 4. Install Additional Dependencies

```bash
pip install httpx dotenv sqlmodel
```

---

## 🚀 Run the Application

Make sure your FastAPI app is located at `app/main.py` and contains an `app` instance.

```bash
python -m uvicorn app.main:app --reload
```

> 🔄 The `--reload` flag enables auto-reloading during development.

---

