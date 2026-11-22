import os
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise
from .settings import BASE_DIR

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
application = WhiteNoise(get_wsgi_application(), root=BASE_DIR / "dist", index_file=True)
