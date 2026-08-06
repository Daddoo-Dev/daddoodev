#!/usr/bin/env python3
"""Upload a new quiz JSON file to the YetiMatch `quizzes` Firestore collection.

Usage:
    python3 scripts/add_quiz.py path/to/quiz.json

Requires: gcloud CLI authenticated as a user/service account with Firestore
write access to the `daddoodev` project (the same project ymApi reads from).
Run `gcloud auth login` first if `gcloud auth print-access-token` fails.

Creates the document at quizzes/{id} using quiz.id as the document ID. Fails
loudly (409) if a quiz with that id already exists, so it never silently
overwrites one — delete or rename first if you meant to replace it.
"""
import datetime
import json
import subprocess
import sys
import urllib.error
import urllib.request

PROJECT = "daddoodev"
COLLECTION = "quizzes"

VALID_CATEGORY_IDS = {
    "relationship-love",
    "who-am-i",
    "career-success",
    "friendship-social",
    "personality-self",
    "fun-entertainment",
    "wellness-mindset",
    "pop-culture-fandom",
}


def to_firestore_value(v):
    if v is None:
        return {"nullValue": None}
    if isinstance(v, bool):
        return {"booleanValue": v}
    if isinstance(v, int):
        return {"integerValue": str(v)}
    if isinstance(v, float):
        return {"doubleValue": v}
    if isinstance(v, str):
        return {"stringValue": v}
    if isinstance(v, list):
        return {"arrayValue": {"values": [to_firestore_value(x) for x in v]}}
    if isinstance(v, dict):
        return {"mapValue": {"fields": {k: to_firestore_value(val) for k, val in v.items()}}}
    raise TypeError(f"Unsupported type in quiz JSON: {type(v)}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/add_quiz.py path/to/quiz.json", file=sys.stderr)
        sys.exit(1)

    quiz_path = sys.argv[1]
    with open(quiz_path) as f:
        quiz = json.load(f)

    for required in ("id", "title", "questions", "results"):
        if not quiz.get(required):
            print(f"Missing required field: {required}", file=sys.stderr)
            sys.exit(1)

    category_id = quiz.get("categoryId")
    if category_id not in VALID_CATEGORY_IDS:
        print(
            f"Warning: categoryId '{category_id}' is not one of the known categories:\n  "
            + "\n  ".join(sorted(VALID_CATEGORY_IDS)),
            file=sys.stderr,
        )

    doc_id = quiz["id"]

    fields = {
        "id": quiz["id"],
        "title": quiz["title"],
        "description": quiz.get("description", ""),
        "categoryId": category_id,
        "questions": quiz["questions"],
        "results": quiz["results"],
    }
    fs_fields = {k: to_firestore_value(v) for k, v in fields.items()}
    now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    fs_fields["updatedAt"] = {"timestampValue": now_iso}

    body = json.dumps({"fields": fs_fields}).encode()

    try:
        token = subprocess.check_output(["gcloud", "auth", "print-access-token"]).decode().strip()
    except subprocess.CalledProcessError:
        print("Not logged in to gcloud. Run `gcloud auth login` first.", file=sys.stderr)
        sys.exit(1)

    url = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/"
        f"documents/{COLLECTION}?documentId={doc_id}"
    )
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Created quizzes/{doc_id} ({resp.status})")
    except urllib.error.HTTPError as e:
        if e.code == 409:
            print(
                f"A quiz with id '{doc_id}' already exists. Delete it first "
                "(Firebase Console -> Firestore -> quizzes) if you meant to replace it.",
                file=sys.stderr,
            )
        else:
            print(f"Upload failed ({e.code}): {e.read().decode()}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
