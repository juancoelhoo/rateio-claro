import json
import uuid
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.urls import path
from django.views.decorators.http import require_http_methods
from .models import Encontro


def texto(v):
    return isinstance(v, str) and 0 < len(v.strip()) <= 200


def validar(d):
    if not isinstance(d, dict) or not texto(d.get("nome")):
        raise ValueError("Informe um nome de até 200 caracteres.")
    pessoas, despesas = d.get("pessoas"), d.get("despesas")
    if not isinstance(pessoas, list) or not isinstance(despesas, list):
        raise ValueError("Participantes ou despesas inválidos.")
    ids, nomes = set(), set()
    for p in pessoas:
        if not isinstance(p, dict) or not texto(p.get("id")) or not texto(p.get("nome")):
            raise ValueError("Participante inválido.")
        nome = p["nome"].strip().casefold()
        if nome in nomes or p["id"] in ids:
            raise ValueError("Participante duplicado.")
        ids.add(p["id"])
        nomes.add(nome)
    for item in despesas:
        if not isinstance(item, dict) or not texto(item.get("descricao")) or not texto(item.get("pagador")) or item["pagador"] not in ids:
            raise ValueError("Descrição ou pagador inválido.")
        valor, pesos = item.get("valor"), item.get("pesos")
        if type(valor) is not int or not 0 < valor <= 9999999999:
            raise ValueError("Valor inválido.")
        if not isinstance(pesos, dict) or not pesos or any(k not in ids or type(v) is not int or not 1 <= v <= 9999 for k,v in pesos.items()):
            raise ValueError("Consumidores ou quantidades inválidos.")


def dados(e):
    return {k:getattr(e,k) for k in ("id","nome","pessoas","despesas","revisao","criado","atualizado")}


@require_http_methods(["GET","POST","PUT"])
def encontros(request, pk=None):
    dono = request.session.setdefault("dono", str(uuid.uuid4()))
    registros = Encontro.objects.filter(dono=dono)
    if request.method == "GET":
        if pk:
            return JsonResponse(dados(get_object_or_404(registros, pk=pk)))
        return JsonResponse({"csrf":get_token(request),"encontros":list(registros.order_by("-atualizado").values("id","nome","criado","atualizado"))})
    if (request.method == "PUT") != bool(pk):
        return JsonResponse({"erro":"Operação inválida."},status=405)
    try:
        d = json.loads(request.body)
        validar(d)
    except (ValueError, UnicodeError) as erro:
        return JsonResponse({"erro":str(erro)},status=400)
    with transaction.atomic():
        e = get_object_or_404(registros, pk=pk) if pk else Encontro(dono=dono)
        if pk and d.get("revisao") != e.revisao:
            return JsonResponse({"erro":"O encontro mudou em outra aba. Reabra pelo histórico."},status=409)
        e.nome, e.pessoas, e.despesas = d["nome"].strip(), d["pessoas"], d["despesas"]
        if pk:
            e.revisao += 1
        e.save()
    return JsonResponse(dados(e),status=200 if pk else 201)


urlpatterns = [path("api/encontros/", encontros), path("api/encontros/<uuid:pk>/", encontros)]
