"""Servidor isolado do banco de desenvolvimento para o Playwright."""
import os
import tempfile
from pathlib import Path

from django.core.management import call_command
import django

if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as pasta:
        os.environ.update(DJANGO_SETTINGS_MODULE="backend.settings", RATEIO_DB=str(Path(pasta)/"teste.sqlite3"))
        django.setup()
        call_command("migrate",verbosity=0)
        call_command("runserver","127.0.0.1:8173",use_reloader=False)
