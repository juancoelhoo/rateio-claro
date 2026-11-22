import uuid
from django.db import models

class Encontro(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    dono = models.UUIDField(db_index=True)
    nome = models.CharField(max_length=200)
    pessoas = models.JSONField(default=list)
    despesas = models.JSONField(default=list)
    revisao = models.PositiveIntegerField(default=1)
    atualizado = models.DateTimeField(auto_now=True)
    criado = models.DateTimeField(auto_now_add=True)
