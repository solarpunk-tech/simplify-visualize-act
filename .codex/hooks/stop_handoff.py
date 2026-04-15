#!/usr/bin/env python3
import json
import os
import re
import subprocess
import sys
from pathlib import Path


def read_existing_sections(path: Path) -> dict[str, list[str]]:
    if not path.exists():
        return {}
    sections: dict[str, list[str]] = {}
    current = None
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        if line.startswith("## "):
            current = line[3:].strip()
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)
    return sections


def git_output(cwd: Path, args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


def compact_status(text: str) -> str:
    if not text:
        return "clean"
    parts = [part.strip() for part in text.splitlines() if part.strip()]
    return "; ".join(parts)


def recent_transcript_hint(path_str: str | None) -> str:
    if not path_str:
        return ""
    path = Path(path_str)
    if not path.exists():
        return ""
    try:
        tail = path.read_text(encoding="utf-8", errors="ignore")[-5000:]
    except OSError:
        return ""
    lines = [line.strip() for line in tail.splitlines() if line.strip()]
    if not lines:
        return ""
    return lines[-1][:500]


def compact_message(text: str | None) -> str:
    if not text:
        return ""
    line = " ".join(part.strip() for part in text.splitlines() if part.strip())
    return line[:500]


def as_bullets(values: list[str]) -> list[str]:
    cleaned: list[str] = []
    for value in values:
        stripped = value.strip()
        if not stripped:
            continue
        cleaned.append(stripped if stripped.startswith("- ") else f"- {stripped}")
    return cleaned


def section_text(sections: dict[str, list[str]], name: str) -> str:
    return " ".join(line.strip("- ").strip() for line in sections.get(name, []) if line.strip()).strip()


def first_matching_section(sections: dict[str, list[str]], prefix: str, fallback: str) -> str:
    for name in sections:
        if name.startswith(prefix):
            return name
    return fallback


def has_screenshot_artifacts(lines: list[str]) -> bool:
    joined = " ".join(lines)
    has_png = ".png" in joined
    has_before = re.search(r"\bbefore\b", joined, re.IGNORECASE) is not None
    has_after = re.search(r"\bafter\b", joined, re.IGNORECASE) is not None
    return bool(has_png and has_before and has_after)


def looks_like_ui_task(goal: str, changed: str, visual_refs: str) -> bool:
    haystack = f"{goal} {changed} {visual_refs}".lower()
    keywords = [
        "ui",
        "screen",
        "screenshot",
        "layout",
        "style",
        "typography",
        "color",
        "component",
        "page",
        "route",
        "visual",
    ]
    return any(word in haystack for word in keywords)


def render_handoff(ordered_sections: list[tuple[str, list[str]]]) -> str:
    parts = ["# Session Handoff", ""]
    for name, body in ordered_sections:
        parts.append(f"## {name}")
        parts.extend(body if body else ["- Pending update."])
        parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def main() -> None:
    payload = json.load(sys.stdin)
    cwd = Path(payload.get("cwd") or os.getcwd())
    handoff_path = cwd / ".codex" / "context" / "session-handoff.md"
    handoff_path.parent.mkdir(parents=True, exist_ok=True)

    existing = read_existing_sections(handoff_path)
    what_changed_name = first_matching_section(existing, "What Changed", "What Changed")

    branch = git_output(cwd, ["branch", "--show-current"]) or "unknown"
    status = compact_status(git_output(cwd, ["status", "--short"]))
    recent_commit = git_output(cwd, ["log", "-1", "--oneline"]) or "No commits found."
    assistant_message = compact_message(payload.get("last_assistant_message"))
    transcript_hint = recent_transcript_hint(payload.get("transcript_path"))

    goal_lines = as_bullets(existing.get("Goal") or ["Continue the current repository task safely."])
    goal_text = section_text({"Goal": goal_lines}, "Goal")

    visual_ref_lines = as_bullets(
        existing.get("Visual References")
        or [
            "No screenshot references captured yet.",
        ]
    )
    evidence_lines = as_bullets(
        existing.get("UI Evidence Artifacts")
        or [
            "Missing required before/after artifact paths when screenshot-gated UI proof is required.",
        ]
    )

    changed_lines = as_bullets(existing.get(what_changed_name) or [])
    changed_text = section_text({what_changed_name: changed_lines}, what_changed_name)
    visual_ref_text = section_text({"Visual References": visual_ref_lines}, "Visual References")
    ui_task = looks_like_ui_task(goal_text, changed_text, visual_ref_text)
    evidence_ready = has_screenshot_artifacts(evidence_lines)

    existing_state = section_text(existing, "Completion State").upper()
    if existing_state in {"COMPLETE", "INCOMPLETE"}:
        completion_state = existing_state
    elif ui_task and not evidence_ready:
        completion_state = "INCOMPLETE"
    else:
        completion_state = "COMPLETE"

    blockers = as_bullets(existing.get("Outstanding Blockers") or [])
    if completion_state == "INCOMPLETE" and not blockers:
        blockers = as_bullets(
            [
                "UI proof artifacts are missing for a screenshot-gated or visually ambiguous UI task.",
                "Capture before/after screenshots and add evidence paths before marking complete.",
            ]
        )
    if completion_state == "COMPLETE" and not blockers:
        blockers = ["- None."]

    validation_lines = as_bullets(
        existing.get("Validation")
        or [
            "Validation state pending update.",
        ]
    )
    next_action_lines = as_bullets(
        existing.get("Next 3 Actions")
        or [
            "Review blockers and completion state before new implementation.",
            "Check `git status --short` and inspect targeted files.",
            "Proceed with the smallest pending implementation or verification step.",
        ]
    )[:3]

    branch_lines = as_bullets(
        [
            f"Branch: `{branch}`.",
            f"Git status: `{status}`.",
            f"Latest commit: `{recent_commit}`.",
            "Resume by reading this handoff before edits.",
        ]
    )
    if assistant_message:
        branch_lines.append(f"- Last assistant message: {assistant_message}")
    if transcript_hint and transcript_hint not in assistant_message:
        branch_lines.append(f"- Transcript tail hint: {transcript_hint}")

    ordered_sections = [
        ("Goal", goal_lines),
        ("Completion State", [f"- {completion_state}"]),
        ("Outstanding Blockers", blockers),
        ("Visual References", visual_ref_lines),
        ("UI Evidence Artifacts", evidence_lines),
        (what_changed_name, changed_lines or ["- No change summary recorded in this handoff revision."]),
        ("Validation", validation_lines),
        ("Next 3 Actions", next_action_lines),
        ("Branch / Status", branch_lines),
    ]

    handoff_path.write_text(render_handoff(ordered_sections), encoding="utf-8")
    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    main()
