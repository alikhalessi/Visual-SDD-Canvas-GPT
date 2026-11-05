#!/usr/bin/env python3
"""Reproducible, secret-free evidence for one Visual SDD handoff."""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import sys
from datetime import datetime, timezone
from sdd_runner_adapter import validate

REQUIRED = ("manifest.json", "spec.md", "plan.md", "tasks.md", "AGENT_PROMPT.md")
RUN_DIR = re.compile(r"^900-visual-sdd-run-(\d{1,9})$")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def verify_feature(feature: pathlib.Path) -> dict:
    require(feature.is_dir(), "Run directory missing")
    name = RUN_DIR.fullmatch(feature.name)
    require(bool(name), "Unexpected run directory")
    files = {key: feature / key for key in REQUIRED}
    for key, path in files.items():
        require(path.is_file() and not path.is_symlink(), "Missing or unsafe " + key)
        require(path.stat().st_size < 17000, "Oversized " + key)
    manifest = validate(json.loads(files["manifest.json"].read_text("utf8")))
    req = manifest["requirement"]
    task = manifest["task"]
    spec = files["spec.md"].read_text("utf8")
    plan = files["plan.md"].read_text("utf8")
    tasks = files["tasks.md"].read_text("utf8")
    prompt = files["AGENT_PROMPT.md"].read_text("utf8")
    assertions = {
        "manifest_schema_valid": True,
        "spec_requirement_present": req["id"] in spec and req["title"] in spec,
        "acceptance_criteria_present": all(c["id"] in spec and c["text"] in spec for c in req["criteria"]),
        "task_identifier_present": task["id"] in tasks and task["title"] in tasks,
        "task_acceptance_links_present": all(cid in tasks for cid in task["criterionIds"]),
        "approved_spec_revision_recorded": str(manifest["approvals"]["specRevision"]) in plan,
        "technical_plan_recorded": manifest["technical"]["architecture"] in plan,
        "agent_prompt_scoped": ("agent-preview/" + name.group(1) + "/") in prompt,
        "agent_prompt_denies_merge": "Never modify existing application code" in prompt,
    }
    require(all(assertions.values()), "Verification failure: " + ", ".join(k for k, v in assertions.items() if not v))
    digests = {
        key: {"sha256": hashlib.sha256(files[key].read_bytes()).hexdigest(), "bytes": files[key].stat().st_size}
        for key in REQUIRED
    }
    return {
        "schemaVersion": 1,
        "kind": "visual-sdd-verification-evidence",
        "status": "validated",
        "runId": manifest["runId"],
        "issue": int(name.group(1)),
        "mode": manifest["mode"],
        "verificationScope": "manifest, Spec Kit-compatible documents, task links and output constraints",
        "checks": assertions,
        "fileDigests": digests,
        "agentExecuted": False,
        "codeChangesVerified": False,
        "note": "This evidence verifies an actual artifact handoff, not AI execution or product acceptance.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--feature", required=True, type=pathlib.Path)
    parser.add_argument("--evidence", required=True, type=pathlib.Path)
    args = parser.parse_args()
    result = verify_feature(args.feature)
    require(args.evidence.parent.resolve() == args.feature.resolve(), "Evidence must stay in the run directory")
    result["checkedAt"] = datetime.now(timezone.utc).isoformat()
    args.evidence.write_text(json.dumps(result, indent=2) + "\n", encoding="utf8")
    print("VISUAL SDD EVIDENCE PASS: " + str(len(result["checks"])) + " artifact checks")
    print("Issue #" + str(result["issue"]) + " | " + result["runId"] + " | mode " + result["mode"])
    print("AI run: NOT VERIFIED. Code changes: NOT VERIFIED.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print("VISUAL SDD EVIDENCE BLOCKED: " + str(exc), file=sys.stderr)
        sys.exit(2)
