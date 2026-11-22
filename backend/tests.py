from django.test import TestCase, Client

class HistoricoTests(TestCase):
    url = "/api/encontros/"
    encontro = {"nome":"Almoço","pessoas":[],"despesas":[]}

    def criar(self):
        return self.client.post(self.url,self.encontro,content_type="application/json").json()

    def test_outro_encontro_preserva_primeiro(self):
        primeiro = self.criar()
        self.criar()
        self.assertEqual(len(self.client.get(self.url).json()["encontros"]),2)
        self.assertEqual(self.client.get(self.url+primeiro["id"]+"/").json(),primeiro)

    def test_revisao_antiga_nao_sobrescreve_despesas(self):
        antigo = self.criar()
        url = self.url+antigo["id"]+"/"
        novo = {**antigo,"pessoas":[{"id":"a","nome":"Ana"}],"despesas":[{"descricao":"Café","valor":500,"pagador":"a","pesos":{"a":1}}]}
        self.assertEqual(self.client.put(url,novo,content_type="application/json").status_code,200)
        self.assertEqual(self.client.put(url,antigo,content_type="application/json").status_code,409)
        self.assertEqual(self.client.get(url).json()["despesas"],novo["despesas"])

    def test_outro_navegador_nao_acessa_encontro(self):
        registro = self.criar()
        self.assertEqual(Client().get(self.url+registro["id"]+"/").status_code,404)

    def test_rejeita_consumidor_desconhecido(self):
        resposta = self.client.post(self.url,{**self.encontro,"pessoas":[{"id":"a","nome":"Ana"}],"despesas":[{"descricao":"Café","valor":10,"pagador":"a","pesos":{"b":1}}]},content_type="application/json")
        self.assertEqual(resposta.status_code,400)
        self.assertEqual(self.client.get(self.url).json()["encontros"],[])
