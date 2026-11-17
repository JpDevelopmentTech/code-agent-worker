import { afterEach, describe, expect, it, vi } from "vitest";
import { GithubPullRequestPublisher } from "./github-pull-request.publisher";

const signal = new AbortController().signal;

/** Sustituye `fetch` por uno que responde siempre lo mismo y devuelve el mock para inspeccionarlo. */
function stubFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("GithubPullRequestPublisher", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return the url and the number when GitHub creates the PR", async () => {
    stubFetch(201, { html_url: "https://github.com/jpdev/api/pull/7", number: 7 });
    const publisher = new GithubPullRequestPublisher("token");

    const opened = await publisher.open(
      { repositoryFullName: "jpdev/api", title: "T", head: "jolup/x", base: "main", body: "B" },
      signal,
    );

    expect(opened).toEqual({ url: "https://github.com/jpdev/api/pull/7", number: 7 });
  });

  it("should PATCH the PR with only the new body when updating it", async () => {
    const fetchMock = stubFetch(200, { html_url: "https://github.com/jpdev/api/pull/7", number: 7 });
    const publisher = new GithubPullRequestPublisher("token");

    await publisher.updateBody({ repositoryFullName: "jpdev/api", number: 7 }, "cuerpo nuevo", signal);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.github.com/repos/jpdev/api/pulls/7");
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ body: "cuerpo nuevo" }));
  });

  it("should throw a readable error when GitHub rejects the update", async () => {
    stubFetch(403, { message: "Resource not accessible by personal access token" });
    const publisher = new GithubPullRequestPublisher("token");

    await expect(
      publisher.updateBody({ repositoryFullName: "jpdev/api", number: 7 }, "x", signal),
    ).rejects.toThrow("HTTP 403): Resource not accessible by personal access token");
  });
});
