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
