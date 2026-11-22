import os
from pathlib import Path
from django.core.management.utils import get_random_secret_key

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    path = BASE_DIR / ".django-secret"
    try:
        with path.open("x") as f:
            path.chmod(0o600)
            f.write(get_random_secret_key())
    except FileExistsError:
        pass
    SECRET_KEY = path.read_text()
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ROOT_URLCONF = "backend.urls"
INSTALLED_APPS = ["backend"]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": os.getenv("RATEIO_DB", BASE_DIR / "db.sqlite3"), "OPTIONS": {"transaction_mode": "IMMEDIATE"}}}
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware","django.contrib.sessions.middleware.SessionMiddleware","django.middleware.csrf.CsrfViewMiddleware"]
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
SESSION_COOKIE_AGE = 60 * 60 * 24 * 365
SESSION_SAVE_EVERY_REQUEST = True
USE_TZ = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173","http://127.0.0.1:5173","http://127.0.0.1:4173"]
