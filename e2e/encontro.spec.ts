import { test, expect } from "@playwright/test";
test("divide uma despesa entre duas pessoas e sugere o acerto", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Nome do encontro").fill("Almoço");
  await page.getByRole("button", { name: "Criar encontro" }).click();
  for (const nome of ["Ana", "Bia"]) {
    await page.getByLabel("Nome do participante").fill(nome);
    await page.getByRole("button", { name: "Adicionar participante" }).click();
  }
  await page.getByLabel("Descrição").fill("Pizza");
  await page.getByLabel("Valor (R$)").fill("30");
  await page.getByRole("button", { name: "Registrar despesa" }).click();
  await expect(
    page.getByText(/Bia transfere R\$\s*15,00 para Ana/),
  ).toBeVisible();
});

test("preserva o encontro anterior no histórico", async ({ page }) => {
  await page.goto("/");
  for (const nome of ["Piquenique", "Jantar"]) {
    await page.getByLabel("Nome do encontro").fill(nome);
    await page.getByRole("button", { name: "Criar encontro" }).click();
    await expect(
      page.getByRole("heading", { name: nome, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Começar outro encontro" }).click();
  }
  await page.reload();
  await page.getByRole("button", { name: "Piquenique" }).click();
  await expect(
    page.getByRole("heading", { name: "Piquenique", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Piquenique", exact: true }),
  ).toBeVisible();
});

test("divide bebidas somente entre quem consumiu", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome do encontro").fill("Bebidas");
  await page.getByRole("button", { name: "Criar encontro" }).click();
  for (const nome of ["Ana", "Bia"]) {
    await page.getByLabel("Nome do participante").fill(nome);
    await page.getByRole("button", { name: "Adicionar participante" }).click();
  }
  await page.getByLabel("Ana", { exact: true }).uncheck();
  await page.getByLabel("Descrição").fill("Suco");
  await page.getByLabel("Valor (R$)").fill("30");
  await page.getByRole("button", { name: "Registrar despesa" }).click();
  await expect(page.getByText(/Bia transfere R\$\s*30,00 para Ana/)).toBeVisible();
  await expect(page.getByRole("row", { name: /Bia R\$\s*0,00 R\$\s*30,00 -R\$\s*30,00/ })).toBeVisible();
});

test("registra consumo por quantidade e confere as parcelas", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome do encontro").fill("Lanche");
  await page.getByRole("button", { name: "Criar encontro" }).click();
  for (const nome of ["Ana", "Bia"]) {
    await page.getByLabel("Nome do participante").fill(nome);
    await page.getByRole("button", { name: "Adicionar participante" }).click();
  }
  await page.getByLabel("Divisão").selectOption("quantidade");
  await page.getByLabel("Quantidade de Ana").fill("1");
  await page.getByLabel("Quantidade de Bia").fill("2");
  await page.getByLabel("Descrição").fill("Porções");
  await page.getByLabel("Valor (R$)").fill("30");
  await page.getByRole("button", { name: "Registrar despesa" }).click();
  await expect(page.getByText(/Bia transfere R\$\s*20,00 para Ana/)).toBeVisible();
  await expect(page.getByRole("row", { name: /Bia R\$\s*0,00 R\$\s*20,00 -R\$\s*20,00/ })).toBeVisible();
});

test("consolida despesas pagas por pessoas diferentes no acerto", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome do encontro").fill("Jantar compartilhado");
  await page.getByRole("button", { name: "Criar encontro" }).click();
  for (const nome of ["Ana", "Bia"]) {
    await page.getByLabel("Nome do participante").fill(nome);
    await page.getByRole("button", { name: "Adicionar participante" }).click();
  }
  await page.getByLabel("Descrição").fill("Pizza");
  await page.getByLabel("Valor (R$)").fill("30");
  await page.getByRole("button", { name: "Registrar despesa" }).click();
  await page.getByLabel("Descrição").fill("Sobremesa");
  await page.getByLabel("Valor (R$)").fill("10");
  await page.getByLabel("Quem pagou").selectOption({ label: "Bia" });
  await page.getByRole("button", { name: "Registrar despesa" }).click();
  await expect(page.getByText(/Bia transfere R\$\s*10,00 para Ana/)).toBeVisible();
  await expect(page.getByRole("row", { name: /Ana R\$\s*30,00 R\$\s*20,00 R\$\s*10,00/ })).toBeVisible();
});
