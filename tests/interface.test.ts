// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../src/App";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, options?: RequestInit) => {
      const registro = {
        id: "1",
        criado: "2026-01-01",
        atualizado: "2026-01-01",
        revisao: 1,
        ...JSON.parse(String(options?.body || "{}")),
      };
      return Response.json(
        options ? registro : { csrf: "teste", encontros: [] },
      );
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});
test("restaura um encontro salvo e recalcula o acerto após adicionar uma despesa", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.setItem(
    "rateio-claro-v1",
    JSON.stringify({
      nome: "Viagem",
      pessoas: [
        { id: "a", nome: "Ana" },
        { id: "b", nome: "Bia" },
      ],
      despesas: [],
    }),
  );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(App)));
    await act(async () =>
      Array.from(host.querySelectorAll("button"))
        .find((b) => b.textContent?.includes("Importar"))!
        .click(),
    );
    expect(host.querySelector("h1")?.textContent).toBe("Viagem");
    host.querySelector<HTMLInputElement>("[name=descricao]")!.value = "Café";
    const valor = host.querySelector<HTMLInputElement>("[name=valor]")!;
    valor.value = "10";
    await act(async () => valor.form!.requestSubmit());
    expect(host.textContent).toMatch(/Bia transfere R\$\s*5,00 para Ana/);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    localStorage.clear();
  }
});

test("impede cadastrar novamente um participante com diferença de espaços e maiúsculas", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  async function preencher(campo: string, texto: string) {
    const input = host.querySelector<HTMLInputElement>(
      `input[name="${campo}"]`,
    )!;
    input.value = texto;
    await act(async () => input.form!.requestSubmit());
  }
  try {
    await act(async () => root.render(createElement(App)));
    await preencher("nome", "Piquenique");
    await preencher("pessoa", "Ana");
    await preencher("pessoa", " ANA ");
    expect(host.querySelector("[role=alert]")?.textContent).toMatch(
      /já está no encontro/,
    );
    expect(host.querySelectorAll(".grid section:first-child li")).toHaveLength(
      1,
    );
  } finally {
    await act(async () => root.unmount());
    host.remove();
    localStorage.clear();
  }
});
