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
