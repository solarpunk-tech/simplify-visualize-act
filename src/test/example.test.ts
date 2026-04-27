import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";
import { inboxThreads, unifiedTasks } from "@/lib/ubik-data";

describe("Ubik shell", () => {
  it("keeps chat as the default route", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Back at it, Hemanth")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask anything about operations, projects, or follow-through."),
    ).toBeInTheDocument();
    expect(screen.getByText("Previous chats")).toBeInTheDocument();
    expect(screen.queryByText("Suggested asks")).not.toBeInTheDocument();
  });

  it("renders Home on /home", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Morning brief")).toBeInTheDocument();
    expect(screen.getByText("Usage intelligence")).toBeInTheDocument();
    expect(screen.getByText("Revenue influenced")).toBeInTheDocument();
    expect(screen.getByText("Working capital protected")).toBeInTheDocument();
    expect(screen.getByText("+6.2h")).toBeInTheDocument();
    expect(screen.getByText("+0.6 pts")).toBeInTheDocument();
    expect(screen.getByText("Task list")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open tasks" })).toBeInTheDocument();
    expect(screen.getByText("Execution queue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
  });

  it("removes the expanded morning brief task jump action", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    fireEvent.click(await screen.findByRole("button", { name: "Expand" }));

    expect(await screen.findByRole("button", { name: "Collapse" })).toBeInTheDocument();
    expect(screen.getByText("Today’s operator summary")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByText("View all in Tasks")).not.toBeInTheDocument();
  });

  it("keeps Home follow-through preview scan-first", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Task list")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New" })).not.toBeInTheDocument();
    expect(screen.queryByText("Bid now")).not.toBeInTheDocument();
    expect(screen.queryByText("Needs action")).not.toBeInTheDocument();
    expect(screen.queryByText("Revenue Pulse")).not.toBeInTheDocument();
    expect(screen.queryByText("Pricing pressure")).not.toBeInTheDocument();
    expect(screen.queryByText("Set priority")).not.toBeInTheDocument();
  });

  it("opens the selected task document from Home task rows", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Task list")).toBeInTheDocument();
    fireEvent.click(screen.getByText(unifiedTasks[0]?.title ?? ""));

    expect(await screen.findByText("Task document")).toBeInTheDocument();
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add update" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("tab", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Details" })).not.toBeInTheDocument();
    expect(window.location.pathname).toBe("/tasks");
    expect(window.location.search).toContain(`task=${unifiedTasks[0]?.id ?? ""}`);
  });

  it("renders Inbox detail on /inbox/:threadId", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByLabelText("Search inbox threads")).toBeInTheDocument();
    expect(screen.getAllByText(inboxThreads[0]?.subject ?? "").length).toBeGreaterThan(0);
  });

  it("renders meeting detail tabs with a cleaner summary document", async () => {
    window.history.pushState({}, "", "/meetings/meeting-4?tab=meetings-11");
    render(createElement(App));

    expect(await screen.findByText("Redwood Foods renewal prep quick note")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Transcript" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Files" })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/# Overview/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nudge Move the best objections into the renewal prep packet\./ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Ask about this meeting" })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Transcript" }));
    expect(await screen.findByText(/Capture the top objections before the renewal call/)).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Files" }));
    expect(await screen.findByText("renewal-objections.md")).toBeInTheDocument();
  });

  it("redirects Projects into the default scoped workspace", async () => {
    window.history.pushState({}, "", "/projects");
    render(createElement(App));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/projects/po-queue");
    });
    expect(await screen.findByText("Document Queue")).toBeInTheDocument();
  });

  it("redirects Workflows into project templates", async () => {
    window.history.pushState({}, "", "/workflows");
    render(createElement(App));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/projects/templates");
    });
    expect(await screen.findByText("Preset library")).toBeInTheDocument();
  });

  it("renders the MR-Q2 project detail dashboard", async () => {
    window.history.pushState({}, "", "/projects/delivery-workflow/project-mr-q2");
    render(createElement(App));

    expect((await screen.findAllByText("Mumbai-Rotterdam Q2")).length).toBeGreaterThan(0);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Emails" })).toBeInTheDocument();
    expect(screen.getByText("Decision trace")).toBeInTheDocument();
    expect(screen.getByText("Operational trend")).toBeInTheDocument();
  });

  it("supports project queue multi-select and archive", async () => {
    window.history.pushState({}, "", "/projects/po-queue");
    render(createElement(App));

    fireEvent.click(await screen.findByLabelText("Select Channel Fish PO automation"));
    fireEvent.click(screen.getByLabelText("Select Devi Seafoods ERP confirmation"));

    expect(await screen.findByText("2 selected")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Archive" }).at(-1)!);

    await waitFor(() => {
      expect(screen.queryByText("Channel Fish PO automation")).not.toBeInTheDocument();
    });
  });

  it("renders the linear task view by default on /tasks", async () => {
    window.history.pushState({}, "", "/tasks");
    render(createElement(App));

    expect(await screen.findByPlaceholderText("Filter tasks...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Kanban/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by priority" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("No deadline")).toBeInTheDocument();
    expect(screen.getByText(unifiedTasks[0]?.title ?? "")).toBeInTheDocument();
  });

  it("opens the detail task view for deep-linked tasks", async () => {
    window.history.pushState({}, "", `/tasks?task=${unifiedTasks[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Task document")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Open source" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getAllByText("Assignee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Priority").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("Add an update, follow-through note, or handoff detail...")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Details" })).not.toBeInTheDocument();
    expect(screen.getAllByText(unifiedTasks[0]?.title ?? "").length).toBeGreaterThan(0);
  });

  it("renders the kanban task view from search params", async () => {
    window.history.pushState({}, "", "/tasks?view=kanban");
    render(createElement(App));

    expect(await screen.findByText("Kanban view")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("No deadline")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("falls back to list when the removed gantt view is requested", async () => {
    window.history.pushState({}, "", "/tasks?view=gantt");
    render(createElement(App));

    expect(await screen.findByPlaceholderText("Filter tasks...")).toBeInTheDocument();
    expect(screen.queryByText("Task timeline")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("keeps the same Inbox tab when switching threads", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}?tab=inbox-main`);
    render(createElement(App));

    expect(await screen.findByLabelText("Search inbox threads")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });

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
