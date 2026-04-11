import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "@/App";

describe("Ubik shell", () => {
  it("renders the Chat home as the default operator entry point", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    expect(await screen.findByText("Start with a question or a task.")).toBeInTheDocument();
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

  it("opens the plus menu and adds connector context", async () => {
    window.history.pushState({}, "", "/");
    render(createElement(App));

    const trigger = await screen.findByLabelText("Open context menu");
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Salesforce" }));

    expect(await screen.findByText("Salesforce")).toBeInTheDocument();
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
});
