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

  it("expands Home task rows inline with shared task actions", async () => {
    window.history.pushState({}, "", "/home");
    render(createElement(App));

    expect(await screen.findByText("Task list")).toBeInTheDocument();
    fireEvent.click(screen.getByText(unifiedTasks[0]?.title ?? ""));

    expect(await screen.findByRole("button", { name: "Set priority" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assign" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open in Tasks" })).toBeInTheDocument();
  });

  it("renders Inbox detail on /inbox/:threadId", async () => {
    window.history.pushState({}, "", `/inbox/${inboxThreads[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(screen.getAllByText(inboxThreads[0]?.subject ?? "").length).toBeGreaterThan(0);
  });

  it("renders the linear task view by default on /tasks", async () => {
    window.history.pushState({}, "", "/tasks");
    render(createElement(App));

    expect(await screen.findByRole("heading", { name: "Keep follow-through clean" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
    expect(screen.getByText("Execution list")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by priority" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Priority" })).toBeInTheDocument();
    expect(screen.getByText(unifiedTasks[0]?.title ?? "")).toBeInTheDocument();
  });

  it("opens the detail task view for deep-linked tasks", async () => {
    window.history.pushState({}, "", `/tasks?task=${unifiedTasks[0]?.id ?? ""}`);
    render(createElement(App));

    expect(await screen.findByRole("heading", { name: "Keep follow-through clean" })).toBeInTheDocument();
    expect(screen.getAllByText("Set priority").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
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

    expect(await screen.findByText("Execution list")).toBeInTheDocument();
    expect(screen.queryByText("Task timeline")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
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
