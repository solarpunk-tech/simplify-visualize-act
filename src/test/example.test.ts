import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "@/App";

describe("Ubik shell", () => {
  it("renders the Chat home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Start with a question or a task")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context.")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search threads, notes, approvals")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent Work")).not.toBeInTheDocument();
  });

  it("preserves Chat composer state when switching tabs", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Prepare the operator note for the Thai Union review." },
    });

    fireEvent.click(screen.getAllByText("Inbox")[0]);

    await waitFor(() => {
      expect(screen.getByText("Inbox keeps inbound work readable and actionable.")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText("Know Anything")[0]);

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Prepare the operator note for the Thai Union review."),
      ).toBeInTheDocument();
    });
  });

  it("supports chat modes and source chips on Know Anything", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Max"));
    fireEvent.click(screen.getByText("Internet"));

    fireEvent.click(screen.getByLabelText("Run prompt"));

    expect(await screen.findByText("Know Anything runtime")).toBeInTheDocument();
    expect(screen.getByText("MAX")).toBeInTheDocument();
    expect(screen.getByText("Internet")).toBeInTheDocument();
  });

  it("reuses the base Know Anything tab when New Thread is clicked on a pristine chat", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    fireEvent.click(await screen.findByText("New Thread"));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    expect(composer).toHaveValue("");
    expect(window.location.search).toContain("tab=chat-home");
  });

  it("creates a fresh Know Anything tab when New Thread is clicked after work starts", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Draft a shipment delay response." },
    });

    fireEvent.click(await screen.findByText("New Thread"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(
      screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context."),
    ).toHaveValue("");
  });

  it("adds connector context from the composer toolbar", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByLabelText("Open context menu"));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Salesforce" }));

    expect(await screen.findByText("Salesforce")).toBeInTheDocument();
  });

  it("opens the share dialog from Know Anything", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Share"));

    expect(await screen.findByRole("heading", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Only me")).toBeInTheDocument();
    expect(screen.getByText("Team access")).toBeInTheDocument();
    expect(screen.getByText("Public access")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("opens a fresh temporary chat from the composer icon", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    fireEvent.change(composer, {
      target: { value: "Review the latest approvals queue." },
    });

    fireEvent.click(screen.getByLabelText("Open temporary chat"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(
      screen.getByPlaceholderText("Start with an operator task, a thread to continue, or a decision that needs context."),
    ).toHaveValue("");
    expect(screen.getByText("Temp Chat")).toBeInTheDocument();
  });

  it("limits the workbench to 8 tabs", async () => {
    window.history.pushState({}, "", "/?tab=chat-home");
    render(createElement(App));

    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByLabelText("Open temporary chat"));
      await waitFor(() => {
        expect(screen.getAllByText("Temp Chat").length).toBe(index + 1);
      });
    }

    fireEvent.click(screen.getByLabelText("Open temporary chat"));
    fireEvent.click(await screen.findByText("New Thread"));

    await waitFor(() => {
      expect(screen.getByText("Tab limit reached")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("button", { name: /Close / }).length).toBe(7);
  });

  it("opens the command palette from Create", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    expect(await screen.findByPlaceholderText("Type a command or search...")).toBeInTheDocument();
    expect(screen.getByText("SUGGESTED")).toBeInTheDocument();
  });

  it("runs Summarize priorities into a new Know Anything tab", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    fireEvent.click(await screen.findByText("Summarize today's priorities"));

    const composer = await screen.findByPlaceholderText(
      "Start with an operator task, a thread to continue, or a decision that needs context.",
    );

    await waitFor(() => {
      expect(composer).toHaveValue(
        "Summarize today's priorities using Inbox, Approvals, and Meetings. Output top 5 priorities with next action, owner, and ETA.",
      );
    });
  });

  it("runs approvals fetch into drawer and runtime and navigates to Approvals", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);

    fireEvent.click(await screen.findByText("Fetch pending approvals from agents"));

    await waitFor(() => {
      expect(
        screen.getByText("Approvals keep recommendations direct, auditable, and easy to inspect."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Approvals fetch")).toBeInTheDocument();
  });

  it("renders the inbox decision queue and workspace by default", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    expect(await screen.findByText("Decision queue")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Q2 rate confirmation requires executive response" })).toBeInTheDocument();
    expect(screen.getByText("Thread timeline")).toBeInTheDocument();
    expect(screen.getByText("Action rail")).toBeInTheDocument();
  });

  it("replaces inbox header sort and filter actions with mail actions", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    expect(await screen.findByText("Decision queue")).toBeInTheDocument();
    expect(screen.queryByText("Sort")).not.toBeInTheDocument();
    expect(screen.queryByText("Filter")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Compose" }));
    expect(openSpy).toHaveBeenCalledWith(
      "https://mail.google.com/mail/?view=cm&fs=1&tf=1",
      "_blank",
      "noopener,noreferrer",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Gmail" }));
    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining("mail.google.com/mail/u/0/#search/"),
      "_blank",
      "noopener,noreferrer",
    );

    openSpy.mockRestore();
  });

  it("filters inbox threads and supports keyboard navigation", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    fireEvent.keyDown(await screen.findByLabelText("Open thread Q2 rate confirmation requires executive response"), {
      key: "ArrowDown",
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cold-chain delay at Mumbai port" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Follow-up risk" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Still waiting on revised delivery note" })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Search threads, company, account, task"), {
      target: { value: "Harbor Retail" },
    });

    expect(screen.getByRole("heading", { name: "Still waiting on revised delivery note" })).toBeInTheDocument();
  });

  it("moves threads through reviewed, watching, and archive transitions", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    expect(await screen.findByRole("heading", { name: "Q2 rate confirmation requires executive response" })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Mark current thread reviewed"));
    fireEvent.click(screen.getByRole("button", { name: "Watching" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Q2 rate confirmation requires executive response" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Archive Q2 rate confirmation requires executive response"));
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Q2 rate confirmation requires executive response" })).toBeInTheDocument();
    });
  });

  it("supports watch transitions from the queue", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    fireEvent.click(await screen.findByRole("button", { name: "Follow-up risk" }));
    fireEvent.click(screen.getByLabelText("Watch Still waiting on revised delivery note"));
    fireEvent.click(screen.getByRole("button", { name: "Watching" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Still waiting on revised delivery note" })).toBeInTheDocument();
    });
  });

  it("opens approval, task, and provenance drawers from the workspace", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    fireEvent.click(await screen.findByRole("button", { name: "Request approval" }));

    expect(await screen.findByText("Proposed action")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByText("Editing")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Dismiss drawer"));

    await waitFor(() => {
      expect(screen.queryByText("Proposed action")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Create or update task" }));

    expect(await screen.findByText("Task packet")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Release rate confirmation")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Dismiss drawer"));

    fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));

    expect(await screen.findByText("Recommendation inputs")).toBeInTheDocument();
  });

  it("renders loading and empty inbox scenarios from seeded fixtures", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main&scenario=loading");
    render(createElement(App));

    expect(await screen.findByLabelText("Queue loading state")).toBeInTheDocument();
    expect(screen.getByLabelText("Workspace loading state")).toBeInTheDocument();
  });

  it("renders the empty inbox scenario from seeded fixtures", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main&scenario=empty");
    render(createElement(App));

    expect(await screen.findByText("No priority threads")).toBeInTheDocument();
  });

  it("renders the error inbox scenario from seeded fixtures", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main&scenario=error");
    render(createElement(App));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ranking degraded");
    expect(screen.getByText(/CRM context is currently unavailable/)).toBeInTheDocument();
  });

  it("renders the permissions-limited inbox scenario from seeded fixtures", async () => {
    window.history.pushState({}, "", "/inbox?tab=inbox-main&scenario=permissions");
    render(createElement(App));

    expect(await screen.findByRole("alert")).toHaveTextContent("permissions-limited");
    expect(screen.getByText(/CRM and ERP fields are partially unavailable/)).toBeInTheDocument();
  });

  it("uses queue-first behavior on narrow widths", async () => {
    const originalWidth = window.innerWidth;
    const originalMatchMedia = window.matchMedia;

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("max-width: 767px"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    window.history.pushState({}, "", "/inbox?tab=inbox-main");
    render(createElement(App));

    expect(screen.queryByText("Thread timeline")).not.toBeInTheDocument();

    fireEvent.click(await screen.findByLabelText("Open thread Q2 rate confirmation requires executive response"));

    expect(await screen.findByRole("button", { name: "Back to queue" })).toBeInTheDocument();
    expect(screen.getByText("Thread timeline")).toBeInTheDocument();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });
});
