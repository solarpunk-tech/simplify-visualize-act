import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { inboxThreads } from "@/lib/ubik-data";

describe("Ubik shell", () => {
  it("keeps chat as the default route", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Back at it, Hemanth")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask anything about operations, projects, or follow-through."),
    ).toBeInTheDocument();
  });

  it("renders Home on /home", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Morning brief")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
    expect(screen.getByText("Revenue Pulse")).toBeInTheDocument();
  });

  it("opens chat from Home using the root route", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    fireEvent.click(await screen.findByRole("button", { name: "New" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
      expect(window.location.search).not.toBe("");
    });
  });

  it("renders Inbox detail on /inbox/:threadId", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getAllByText(inboxThreads[0]?.subject ?? "").length).toBeGreaterThan(0);
  });

  it("keeps the same Inbox tab when switching threads", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}?tab=inbox-main`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    fireEvent.click(screen.getAllByText(inboxThreads[1]?.subject ?? "")[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe(`/inbox/${inboxThreads[1]?.id}`);
      expect(window.location.search).toContain("tab=inbox-main");
    });
  });

  it("still supports the chat share dialog from the root route", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Share"));

    expect(await screen.findByRole("heading", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Only me")).toBeInTheDocument();
  });
});
