#!/usr/bin/env python3
import json
import os
from pathlib import Path


def parse_sections(text: str) -> dict[str, list[str]]:
    lines = [line.rstrip() for line in text.splitlines()]
    sections: dict[str, list[str]] = {}
    current = None
    for line in lines:
        if line.startswith("## "):
            current = line[3:].strip()
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)
    return sections


def section_text(sections: dict[str, list[str]], name: str) -> str:
    body = " ".join(line.strip("- ").strip() for line in sections.get(name, []) if line.strip())
    return body.strip()


def summarize_handoff(text: str) -> str:
    sections = parse_sections(text)
    completion_state = section_text(sections, "Completion State").upper() or "UNKNOWN"
    blockers = section_text(sections, "Outstanding Blockers")
    evidence = section_text(sections, "UI Evidence Artifacts")
    visual_refs = section_text(sections, "Visual References")
    goal = section_text(sections, "Goal")
    next_actions = section_text(sections, "Next 3 Actions")
    validation = section_text(sections, "Validation")
    branch_status = section_text(sections, "Branch / Status") or section_text(
        sections, "Files / Branch / Commands"
    )

    parts: list[str] = ["Resume using the current project handoff."]
    parts.append(f"Completion State: {completion_state}")

    if completion_state != "COMPLETE":
        parts.append("Priority: unresolved work exists. Resolve blockers before new implementation.")
    if blockers:
        parts.append(f"Outstanding Blockers: {blockers}")
    if evidence:
        parts.append(f"UI Evidence Artifacts: {evidence}")
    if visual_refs:
        parts.append(f"Visual References: {visual_refs}")
    if goal:
        parts.append(f"Goal: {goal}")
    if next_actions:
        parts.append(f"Next 3 Actions: {next_actions}")
    if validation:
        parts.append(f"Validation: {validation}")
    if branch_status:
        parts.append(f"Branch / Status: {branch_status}")

    return "\n".join(parts)


def main() -> None:
    payload = json.load(__import__("sys").stdin)
    cwd = Path(payload.get("cwd") or os.getcwd())
    handoff_path = cwd / ".codex" / "context" / "session-handoff.md"
    if not handoff_path.exists():
        print(json.dumps({"continue": True}))
        return

    text = handoff_path.read_text(encoding="utf-8")
    print(
        json.dumps(
            {
                "continue": True,
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": summarize_handoff(text),
                },
            }
        )
    )


if __name__ == "__main__":
    main()
