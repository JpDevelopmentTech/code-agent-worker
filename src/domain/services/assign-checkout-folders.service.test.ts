import { describe, expect, it } from "vitest";
import { assignCheckoutFolders } from "./assign-checkout-folders.service";

const repo = (fullName: string): { fullName: string; baseBranch: string } => ({ fullName, baseBranch: "main" });

describe("assignCheckoutFolders", () => {
  it("should use the repository name when names are unique", () => {
    expect(assignCheckoutFolders([repo("jpdev/api"), repo("jpdev/web")])).toEqual(["api", "web"]);
  });

  it("should prefix the owner only on the repositories that share a name", () => {
    const folders = assignCheckoutFolders([repo("jpdev/api"), repo("cliente/API"), repo("jpdev/web")]);

    expect(folders).toEqual(["jpdev__api", "cliente__API", "web"]);
  });
});
