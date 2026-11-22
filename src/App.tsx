import { useEffect, useState, type FormEvent } from "react";
import {
  centavos,
  parcelas,
  resumo,
  transferencias,
  type Encontro,
} from "./rateio";
import "./style.css";

const chave = "rateio-claro-v1";
const moeda = (n: number) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
type Registro = Encontro & {
  id: string;
  revisao: number;
  criado: string;
  atualizado: string;
};
type Item = Pick<Registro, "id" | "nome" | "criado" | "atualizado">;

async function requisitar(url: string, opcoes?: RequestInit) {
  const resposta = await fetch(url, opcoes);
  if (!resposta.ok) {
    const falha = await resposta.json().catch(() => ({}));
    throw Error(falha.erro || "Falha ao acessar o encontro.");
  }
  return resposta.json();
}
const api = "/api/encontros/";
export default function App() {
  const [encontro, atualizar] = useState<Registro | null>(null);
  const [historico, listar] = useState<Item[]>([]);
  const [csrf, token] = useState("");
  const [ocupado, aguardar] = useState(true);
  const [erro, informar] = useState("");
  const [modo, dividir] = useState("igual");
  useEffect(() => {
    async function iniciar() {
      const lista = await requisitar(api);
      token(lista.csrf);
      listar(lista.encontros);
      const ativo = sessionStorage.getItem("rateio-ativo");
      if (lista.encontros.some((e: Item) => e.id === ativo))
        atualizar(await requisitar(api + ativo + "/"));
    }
    iniciar()
      .catch((e) => informar(e.message))
      .finally(() => aguardar(false));
  }, []);
  async function salvar(proximo: Encontro) {
    const registro: Registro = await requisitar(
      encontro ? api + encontro.id + "/" : api,
      {
        method: encontro ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
        body: JSON.stringify(proximo),
      },
    );
    atualizar(registro);
    listar((anteriores) => [
      registro,
      ...anteriores.filter((e) => e.id !== registro.id),
    ]);
    sessionStorage.setItem("rateio-ativo", registro.id);
  }
  function enviar(acao: (dados: FormData) => Promise<void>) {
    return async (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      const form = evento.currentTarget;
      const dados = new FormData(form);
      aguardar(true);
      try {
        await acao(dados);
        form.reset();
        informar("");
      } catch (e) {
        informar(e instanceof Error ? e.message : "Falha ao salvar.");
      } finally {
        aguardar(false);
      }
    };
  }
  function nome(d: FormData, campo: string) {
    const valor = String(d.get(campo) ?? "").trim();
    if (!valor) throw Error("Preencha o nome ou a descrição.");
    return valor;
  }
  const linhas = encontro ? resumo(encontro) : [];
  const acertos = transferencias(linhas);
  return (
    <main>
      <header>Rateio Claro</header>
      {erro && <p role="alert">{erro}</p>}
      <fieldset disabled={ocupado || !csrf} className="area-trabalho">
        {!encontro ? (
          <section>
            <h1>Dividir despesas</h1>
            <p>
              Crie um encontro para registrar quem pagou e quem participou de
              cada despesa.
            </p>
            <form
              onSubmit={enviar((d) =>
                salvar({ nome: nome(d, "nome"), pessoas: [], despesas: [] }),
              )}
            >
              <label>
                Nome do encontro
                <input name="nome" required placeholder="Almoço de domingo" />
              </label>
              <button>Criar encontro</button>
            </form>
          </section>
        ) : (
          <>
            <h1>{encontro.nome}</h1>
            <p>Encontro salvo no histórico.</p>
            <div className="grid">
              <section>
                <h2>Participantes</h2>
                <ul>
                  {encontro.pessoas.map((p) => (
                    <li key={p.id}>{p.nome}</li>
                  ))}
                </ul>
                <form
                  onSubmit={enviar(async (d) => {
                    const novo = nome(d, "pessoa");
                    if (
                      encontro.pessoas.some(
                        (p) =>
                          p.nome.toLocaleLowerCase("pt-BR") ===
                          novo.toLocaleLowerCase("pt-BR"),
                      )
                    )
                      throw Error("Esse participante já está no encontro.");
                    await salvar({
                      ...encontro,
                      pessoas: [
                        ...encontro.pessoas,
                        { id: crypto.randomUUID(), nome: novo },
                      ],
                    });
                  })}
                >
                  <label>
                    Nome do participante
                    <input name="pessoa" required />
                  </label>
                  <button>Adicionar participante</button>
                </form>
              </section>
              <section>
                <h2>Nova despesa</h2>
                {encontro.pessoas.length === 0 ? (
                  <p>Adicione um participante para começar.</p>
                ) : (
                  <form
                    onSubmit={enviar(async (d) => {
                      const valor = centavos(String(d.get("valor")));
                      const pesos = Object.fromEntries(
                        encontro.pessoas
                          .filter((p) => d.has(p.id))
                          .map((p) => [
                            p.id,
                            modo === "igual" ? 1 : Number(d.get("q" + p.id)),
                          ]),
                      );
                      parcelas(valor, pesos);
                      await salvar({
                        ...encontro,
                        despesas: [
                          ...encontro.despesas,
                          {
                            descricao: nome(d, "descricao"),
                            valor,
                            pesos,
                            pagador: String(d.get("pagador")),
                          },
                        ],
                      });
                      dividir("igual");
                    })}
                  >
                    <label>
                      Descrição
                      <input name="descricao" required />
                    </label>
                    <label>
                      Valor (R$)
                      <input name="valor" inputMode="decimal" required />
                    </label>
                    <label>
                      Quem pagou
                      <select name="pagador">
                        {encontro.pessoas.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Divisão
                      <select
                        value={modo}
                        onChange={(e) => dividir(e.target.value)}
                      >
                        <option value="igual">Igual</option>
                        <option value="quantidade">Por quantidade</option>
                      </select>
                    </label>
                    <fieldset>
                      <legend>Quem consumiu</legend>
                      {encontro.pessoas.map((p) => (
                        <div key={p.id}>
                          <label className="inline">
                            <input type="checkbox" name={p.id} defaultChecked />
                            {p.nome}
                          </label>
                          {modo === "quantidade" && (
                            <label>
                              Quantidade de {p.nome}
                              <input
                                type="number"
                                name={"q" + p.id}
                                defaultValue="1"
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </fieldset>
                    <button>Registrar despesa</button>
                  </form>
                )}
              </section>
            </div>
            <section>
              <h2>Despesas</h2>
              {!encontro.despesas.length && <p>Nenhuma despesa registrada.</p>}
              <ul>
                {encontro.despesas.map((d, i) => (
                  <li key={i}>
                    {d.descricao} · {moeda(d.valor)} · pago por{" "}
                    {encontro.pessoas.find((p) => p.id === d.pagador)?.nome}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Saldos</h2>
              <table>
                <thead>
                  <tr>
                    {["Pessoa", "Pagou", "Consumiu", "Saldo"].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{moeda(p.pago)}</td>
                      <td>{moeda(p.consumo)}</td>
                      <td>{moeda(p.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h2>Acerto de contas</h2>
              {acertos.length ? (
                <ul>
                  {acertos.map((a, i) => (
                    <li key={i}>
                      {a.de} transfere {moeda(a.valor)} para {a.para}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma transferência necessária.</p>
              )}
            </section>
            <button
              onClick={() => {
                sessionStorage.removeItem("rateio-ativo");
                atualizar(null);
                informar("");
                dividir("igual");
              }}
            >
              Começar outro encontro
            </button>
          </>
        )}
        {!encontro && localStorage.getItem(chave) && (
          <button
            onClick={async () => {
              aguardar(true);
              try {
                await salvar(JSON.parse(localStorage.getItem(chave)!));
                localStorage.removeItem(chave);
                informar("");
              } catch {
                informar("Falha ao importar o encontro anterior.");
              } finally {
                aguardar(false);
              }
            }}
          >
            Importar encontro deste navegador
          </button>
        )}
        {historico.length > 0 && (
          <section>
            <h2>Histórico de encontros</h2>
            <ul>
              {historico.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={async () => {
                      aguardar(true);
                      try {
                        atualizar(await requisitar(api + e.id + "/"));
                        sessionStorage.setItem("rateio-ativo", e.id);
                        dividir("igual");
                        informar("");
                      } catch {
                        informar("Falha ao abrir o encontro.");
                      } finally {
                        aguardar(false);
                      }
                    }}
                  >
                    {e.nome}
                  </button>{" "}
                  · {new Date(e.criado).toLocaleDateString("pt-BR")}
                </li>
              ))}
            </ul>
          </section>
        )}
      </fieldset>
    </main>
  );
}
