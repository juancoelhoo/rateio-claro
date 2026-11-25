import { expect, test } from "vitest";
import { centavos, parcelas, resumo, transferencias } from "../src/rateio";

test("converte uma casa decimal sem perder centavos", () =>
  expect(centavos("12,3")).toBe(1230));
test("rejeita valor com fração de centavo", () =>
  expect(() => centavos("2,003")).toThrow());
test("rejeita uma despesa de valor zero", () =>
  expect(() => centavos("0")).toThrow());
test("destina o centavo de desempate ao primeiro consumidor", () =>
  expect(parcelas(100, { ana: 1, bia: 1, caio: 1 })).toEqual({
    ana: 34,
    bia: 33,
    caio: 33,
  }));
test("prioriza a maior fração no rateio por quantidade", () =>
  expect(parcelas(101, { ana: 1, bia: 2 })).toEqual({ ana: 34, bia: 67 }));
test("exige ao menos um consumidor", () =>
  expect(() => parcelas(100, {})).toThrow());
test("recusa valores negativos", () =>
  expect(() => parcelas(-1, { ana: 1 })).toThrow());
const encontro = {
  nome: "Almoço",
  pessoas: [
    { id: "a", nome: "Ana" },
    { id: "b", nome: "Bia" },
  ],
  despesas: [{ descricao: "Suco", pagador: "a", valor: 800, pesos: { b: 1 } }],
};
test("credita o pagador que não consumiu", () =>
  expect(resumo(encontro)[0]).toMatchObject({
    pago: 800,
    consumo: 0,
    saldo: 800,
  }));
test("orienta o pagamento de quem consumiu para quem adiantou", () =>
  expect(transferencias(resumo(encontro))).toEqual([
    { de: "Bia", para: "Ana", valor: 800 },
  ]));

// Entradas de valores em reais.
test("converte um valor inteiro em reais", () => expect(centavos("12")).toBe(1200));
test("converte duas casas decimais com vírgula", () => expect(centavos("12,34")).toBe(1234));
test("converte duas casas decimais com ponto", () => expect(centavos("12.34")).toBe(1234));
test("completa a casa decimal ausente", () => expect(centavos("0,5")).toBe(50));
test("aceita espaços externos", () => expect(centavos("  7,25  ")).toBe(725));
test("converte o menor valor positivo", () => expect(centavos("0,01")).toBe(1));
test("converte o maior valor inteiro permitido", () => expect(centavos("99999999")).toBe(9999999900));
test("rejeita texto vazio", () => expect(() => centavos("")).toThrow());
test("rejeita apenas espaços", () => expect(() => centavos("   ")).toThrow());
test("rejeita valor negativo", () => expect(() => centavos("-1")).toThrow());
test("rejeita sinal positivo", () => expect(() => centavos("+1")).toThrow());
test("rejeita separadores repetidos", () => expect(() => centavos("1,2.3")).toThrow());
test("rejeita separador sem parte inteira", () => expect(() => centavos(",50")).toThrow());
test("rejeita mais de oito algarismos inteiros", () => expect(() => centavos("100000000")).toThrow());

// Distribuição de parcelas e validação dos argumentos.
test("atribui toda a despesa ao único consumidor", () => expect(parcelas(123, { ana: 1 })).toEqual({ ana: 123 }));
test("divide igualmente quando o valor é divisível", () => expect(parcelas(120, { ana: 1, bia: 1, caio: 1 })).toEqual({ ana: 40, bia: 40, caio: 40 }));
test("distribui dois centavos restantes em ordem de cadastro", () => expect(parcelas(5, { ana: 1, bia: 1, caio: 1 })).toEqual({ ana: 2, bia: 2, caio: 1 }));
test("divide proporcionalmente por quantidades diferentes", () => expect(parcelas(900, { ana: 1, bia: 2, caio: 3 })).toEqual({ ana: 150, bia: 300, caio: 450 }));
test("preserva a soma ao ratear muitos centavos restantes", () => {
  const partes = parcelas(1001, { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 });
  expect(Object.values(partes).reduce((soma, valor) => soma + valor, 0)).toBe(1001);
  expect(Object.values(partes).filter((valor) => valor === 167)).toHaveLength(5);
});
test("rejeita despesa zero", () => expect(() => parcelas(0, { ana: 1 })).toThrow());
test("rejeita centavos não inteiros", () => expect(() => parcelas(1.5, { ana: 1 })).toThrow());
test("rejeita valor acima do limite", () => expect(() => parcelas(10000000000, { ana: 1 })).toThrow());
test("rejeita valor que não é inteiro seguro", () => expect(() => parcelas(Number.MAX_SAFE_INTEGER + 1, { ana: 1 })).toThrow());
test("rejeita peso zero", () => expect(() => parcelas(100, { ana: 0 })).toThrow());
test("rejeita peso negativo", () => expect(() => parcelas(100, { ana: -1 })).toThrow());
test("rejeita peso fracionário", () => expect(() => parcelas(100, { ana: 1.5 })).toThrow());
test("rejeita peso nulo", () => expect(() => parcelas(100, { ana: null as unknown as number })).toThrow());
test("rejeita peso acima do limite", () => expect(() => parcelas(100, { ana: 10000 })).toThrow());

// Saldos por participante.
test("retorna lista vazia para encontro sem participantes", () => expect(resumo({ nome: "Vazio", pessoas: [], despesas: [] })).toEqual([]));
test("inicia saldos zerados sem despesas", () => expect(resumo({ nome: "Almoço", pessoas: [{ id: "a", nome: "Ana" }], despesas: [] })).toEqual([{ id: "a", nome: "Ana", pago: 0, consumo: 0, saldo: 0 }]));
test("calcula saldo zero quando pagador consome a própria despesa", () => {
  const dados = { nome: "Café", pessoas: [{ id: "a", nome: "Ana" }], despesas: [{ descricao: "Café", valor: 350, pagador: "a", pesos: { a: 1 } }] };
  expect(resumo(dados)[0]).toMatchObject({ pago: 350, consumo: 350, saldo: 0 });
});
test("acumula despesas pagas por participantes diferentes", () => {
  const dados = { nome: "Viagem", pessoas: [{ id: "a", nome: "Ana" }, { id: "b", nome: "Bia" }], despesas: [{ descricao: "Almoço", valor: 1000, pagador: "a", pesos: { a: 1, b: 1 } }, { descricao: "Táxi", valor: 600, pagador: "b", pesos: { a: 1, b: 1 } }] };
  expect(resumo(dados).map(({ pago, consumo, saldo }) => ({ pago, consumo, saldo }))).toEqual([{ pago: 1000, consumo: 800, saldo: 200 }, { pago: 600, consumo: 800, saldo: -200 }]);
});
test("mantém em zero o saldo de quem não pagou nem consumiu", () => expect(resumo(encontro)[2]).toMatchObject({ pago: 0, consumo: 0, saldo: 0 }));
test("deixa crédito para pagador que não consumiu", () => expect(resumo(encontro)[0]).toMatchObject({ saldo: 800 }));
