import { createElement } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { inboxThreads, meetings } from "@/lib/ubik-data";

const CHAT_PLACEHOLDER = "How can I help you today?";

describe("Ubik shell", () => {
  it("renders Home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Operator Brief")).toBeInTheDocument();
    expect(screen.getByText("Back at it, Hemanth")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(CHAT_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("supports chat modes and source chips on Know Anything", async () => {
    window.history.pushState({}, "", "/chat");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Max"));
    fireEvent.click(screen.getByText("Internet"));
    fireEvent.click(screen.getByLabelText("Run prompt"));

    expect(await screen.findByText("Know Anything runtime")).toBeInTheDocument();
    expect(screen.getByText("MAX")).toBeInTheDocument();
    expect(screen.getByText("Internet")).toBeInTheDocument();
  });

  it("reuses the base Know Anything tab when New Thread is clicked on a pristine chat", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    fireEvent.click(await screen.findByText("New Thread"));

    const composer = await screen.findByPlaceholderText(CHAT_PLACEHOLDER);
    expect(composer).toHaveValue("");
    expect(window.location.search).toContain("tab=chat-main");
  });

  it("creates a fresh Know Anything tab when New Thread is clicked after work starts", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(CHAT_PLACEHOLDER);
    fireEvent.change(composer, {
      target: { value: "Draft a shipment delay response." },
    });

    fireEvent.click(await screen.findByText("New Thread"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(screen.getByPlaceholderText(CHAT_PLACEHOLDER)).toHaveValue("");
  });

  it("toggles optional sources from More sources", async () => {
    window.history.pushState({}, "", "/chat");
    render(createElement(App));

    fireEvent.click(await screen.findByText("More sources"));
    fireEvent.click(screen.getByText("Salesforce"));

    expect(screen.getByText("Organization · Salesforce")).toBeInTheDocument();
  });

  it("opens the share dialog from Know Anything", async () => {
    window.history.pushState({}, "", "/chat");
    render(createElement(App));

    fireEvent.click(await screen.findByText("Share"));

    expect(await screen.findByRole("heading", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByText("Only me")).toBeInTheDocument();
    expect(screen.getByText("Team access")).toBeInTheDocument();
    expect(screen.getByText("Public access")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("opens a fresh temporary chat from the composer icon", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    const composer = await screen.findByPlaceholderText(CHAT_PLACEHOLDER);
    fireEvent.change(composer, {
      target: { value: "Review the latest approvals queue." },
    });

    fireEvent.click(screen.getByLabelText("Open temporary chat"));

    await waitFor(() => {
      expect(window.location.search).not.toContain("tab=chat-home");
    });

    expect(screen.getByPlaceholderText(CHAT_PLACEHOLDER)).toHaveValue("");
    expect(screen.getByText("Temp Chat")).toBeInTheDocument();
  });

  it("limits the workbench to 8 tabs", async () => {
    window.history.pushState({}, "", "/chat?tab=chat-home");
    render(createElement(App));

    for (let index = 0; index < 3; index += 1) {
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

  it("runs approvals fetch into drawer and runtime and navigates to Approvals", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const createButtons = await screen.findAllByLabelText("Open command palette");
    fireEvent.click(createButtons[0]);
    fireEvent.click(await screen.findByText("Fetch pending approvals from agents"));

    await waitFor(() => {
      expect(
        screen.getByText("Human-in-the-loop review queue with auditable recommendations."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Pending approvals")).toBeInTheDocument();
    expect(screen.getByText("Approvals fetch")).toBeInTheDocument();
  });

  it("matches Inbox v4.3 action layout and row schedule flow", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open approval and assign/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open discuss panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open this thread in chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mark thread as read/i })).toBeInTheDocument();

    expect(screen.queryByText("Context suggestion")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Set reminder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Open in Gmail$/i })).not.toBeInTheDocument();

    expect(screen.getAllByText("Mark reviewed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Watch").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Archive").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open in Email").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByLabelText(/Open schedule menu for/i)[0]);
    expect(await screen.findByText("Schedule reminder")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Remind .* tomorrow at 9 AM/i }));
    await waitFor(() => {
      expect(screen.queryByText("Schedule reminder")).not.toBeInTheDocument();
    });
  }, 15000);

  it("keeps the same inbox tab while switching between thread routes", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}?tab=inbox-main`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();

    fireEvent.click(screen.getByText(inboxThreads[1].subject));

    await waitFor(() => {
      expect(window.location.pathname).toBe(`/inbox/${inboxThreads[1].id}`);
      expect(window.location.search).toContain("tab=inbox-main");
    });
  });

  it("removes reviewed threads from the unread filter immediately", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    const unreadCount = inboxThreads.filter((thread) => thread.isUnread).length;

    fireEvent.click(await screen.findByRole("button", { name: "Unread" }));
    expect(await screen.findByText(`${unreadCount} threads`)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Mark reviewed for/i })[0]);

    await waitFor(() => {
      expect(screen.getByText(`${unreadCount - 1} threads`)).toBeInTheDocument();
    });
  });

  it("matches Meetings v4.4 action rail and transcript behavior", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", `/meetings/${meetings[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open share meeting panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open add to project panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open create meeting panel/i })).toBeInTheDocument();
    expect(screen.queryByText("Meeting chat")).not.toBeInTheDocument();

    expect(screen.getByText("Why this matters")).toBeInTheDocument();
    expect(screen.getByText("What changed")).toBeInTheDocument();
    expect(screen.getByText("What is blocked")).toBeInTheDocument();
    expect(screen.getByText("Recommended next step")).toBeInTheDocument();

    expect(screen.queryByText(/Decision:/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /transcript/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show/i }));
    expect(await screen.findByText(/Decision:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open share meeting panel/i }));
    expect(await screen.findByText("App targets")).toBeInTheDocument();
    expect(screen.getByLabelText("Also add to task")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Close share meeting panel/i }));

    fireEvent.click(screen.getByRole("button", { name: /summary/i }));
    const attendeeSection = screen.getByText("Attendees").closest("section");
    expect(attendeeSection).toBeTruthy();
    fireEvent.mouseEnter(within(attendeeSection as HTMLElement).getByText("Raj Mehta"));
    expect(await screen.findByText("What’s on their mind")).toBeInTheDocument();
    expect(screen.getByText("Worth bringing up")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open create meeting panel/i }));
    expect(await screen.findByText("Create meeting request")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "9:30 - 10:00 AM" }));
    fireEvent.click(screen.getByRole("button", { name: /Send request/i }));
    expect(await screen.findByText(/Calendar preview:/i)).toBeInTheDocument();
  }, 15000);

  it("renders distinct meetings calendar modes on landing", async () => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/meetings");
    render(createElement(App));

    expect(await screen.findByText("Schedule landing")).toBeInTheDocument();
    expect(screen.getByText("Week agenda")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^day$/i }));
    expect(await screen.findByText("Day agenda")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^month$/i }));
    expect(await screen.findByText("Month buckets")).toBeInTheDocument();
  }, 15000);
});
