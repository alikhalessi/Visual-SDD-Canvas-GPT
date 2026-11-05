"""Negative and positive tests for the public GitHub issue -> verified artifacts boundary."""
import copy
import json
import pathlib
import sys
import tempfile
import unittest

SCRIPTS = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
from sdd_runner_adapter import HEAD, TAIL, FENCE, validate, extract, render
from verify_run import verify_feature


def fixture():
    return {
        "schemaVersion": 1, "kind": "visual-sdd-agent-run",
        "repository": "alikhalessi/Visual-SDD-Canvas-GPT", "mode": "validate_only",
        "runId": "verified-smoke-2026-04", "createdAt": "2026-11-05T21:00:00Z",
        "product": {"title": "Clinic booking demo", "idea": "Patients select an available appointment and see confirmation."},
        "approvals": {"specRevision": 2, "specApprovedAt": "2026-11-05T21:00:00Z",
                      "planRevision": 3, "planApprovedAt": "2026-11-05T21:00:00Z",
                      "tasksRevision": 2, "tasksApprovedAt": "2026-11-05T21:00:00Z"},
        "technical": {"architecture": "A front end with a server-side appointment booking API and database.",
                      "risks": "Simultaneous booking attempts need transactional checks.",
                      "assumptions": ""},
        "requirement": {"id": "REQ-001", "title": "Book a clinic appointment",
                        "statement": "Patients can reserve an open appointment without contacting the receptionist.",
                        "priority": "must",
                        "criteria": [{"id": "AC-001", "text": "Given an open time, the booking gets confirmation."}]},
        "task": {"id": "TASK-001", "title": "Create an available-appointment selection form",
                 "requirementId": "REQ-001", "criterionIds": ["AC-001"]},
    }


def issue(data=None, owner="alikhalessi"):
    payload = data if data is not None else fixture()
    body = HEAD + "\n" + FENCE + "json\n" + json.dumps(payload) + "\n" + FENCE + "\n" + TAIL
    return {"issue": {"number": 42, "body": body, "user": {"login": owner}}}


class VerifiedHandoffTests(unittest.TestCase):
    def test_valid_manifest_is_bounded(self):
        self.assertEqual(validate(fixture())["mode"], "validate_only")

    def test_owner_only_request_rejects_other_users(self):
        with self.assertRaisesRegex(ValueError, "owner"):
            extract(issue(owner="unknown-user"))

    def test_rejects_unlinked_criteria(self):
        data = fixture()
        data["task"]["criterionIds"] = ["AC-099"]
        with self.assertRaisesRegex(ValueError, "Criterion links"):
            validate(data)

    def test_rejects_forged_repo(self):
        data = fixture()
        data["repository"] = "other/repository"
        with self.assertRaisesRegex(ValueError, "Repository mismatch"):
            validate(data)

    def test_rejects_invalid_approval_revision(self):
        data = fixture()
        data["approvals"]["specRevision"] = 0
        with self.assertRaisesRegex(ValueError, "specRevision"):
            validate(data)

    def test_rejects_duplicate_run_markers(self):
        event = issue()
        event["issue"]["body"] += HEAD
        with self.assertRaisesRegex(ValueError, "marker"):
            extract(event)

    def test_live_evidence_generation_has_sha256_and_honest_status(self):
        manifest, number = extract(issue())
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            feature = render(manifest, number, root)
            result = verify_feature(feature)
            self.assertEqual(result["status"], "validated")
            self.assertEqual(result["issue"], 42)
            self.assertEqual(result["mode"], "validate_only")
            self.assertTrue(all(result["checks"].values()))
            self.assertEqual(len(result["fileDigests"]["manifest.json"]["sha256"]), 64)
            self.assertFalse(result["agentExecuted"])
            self.assertFalse(result["codeChangesVerified"])

    def test_rejects_tampered_specification(self):
        manifest, number = extract(issue())
        with tempfile.TemporaryDirectory() as tmp:
            feature = render(manifest, number, pathlib.Path(tmp))
            (feature / "spec.md").write_text("modified", encoding="utf8")
            with self.assertRaisesRegex(ValueError, "Verification failure"):
                verify_feature(feature)

    def test_rejects_deleted_task_file(self):
        manifest, number = extract(issue())
        with tempfile.TemporaryDirectory() as tmp:
            feature = render(manifest, number, pathlib.Path(tmp))
            (feature / "tasks.md").unlink()
            with self.assertRaisesRegex(ValueError, "Missing"):
                verify_feature(feature)


if __name__ == "__main__":
    unittest.main()
