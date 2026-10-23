#!/usr/bin/env python3
"""Run a dotnet command with the .NET SDK available in this environment.

The repository's Docker-based CI images already provide ``dotnet`` on PATH. Minimal
review or evaluation environments sometimes only provision the SDK under a workspace
directory, so resolve the executable from ``DOTNET``/``DOTNET_ROOT``, PATH and a few
conventional locations before giving up. Arguments are forwarded unchanged.

Usage: python3 src/server/scripts/run-dotnet-tests.py test src/server/Api.Tests/...
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


def candidate_executables():
    explicit = os.environ.get("DOTNET")
    if explicit:
        yield Path(explicit)

    on_path = shutil.which("dotnet")
    if on_path:
        yield Path(on_path)

    roots = [
        os.environ.get("DOTNET_ROOT"),
        str(Path.home() / ".dotnet"),
        "/usr/share/dotnet",
        "/usr/lib/dotnet",
        "/work/.dotnet",
    ]
    for root in roots:
        if root:
            yield Path(root) / "dotnet"


def resolve_dotnet() -> Path | None:
    for candidate in candidate_executables():
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return candidate
    return None


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: run-dotnet-tests.py <dotnet arguments...>", file=sys.stderr)
        return 2

    executable = resolve_dotnet()
    if executable is None:
        print(
            "dotnet SDK not found. Install it on PATH or set DOTNET_ROOT to its location.",
            file=sys.stderr,
        )
        return 127

    env = os.environ.copy()
    env["DOTNET_ROOT"] = str(executable.parent)
    env["PATH"] = str(executable.parent) + os.pathsep + env.get("PATH", "")
    env.setdefault("DOTNET_CLI_TELEMETRY_OPTOUT", "1")
    env.setdefault("DOTNET_NOLOGO", "1")
    env.setdefault("DOTNET_SKIP_FIRST_TIME_EXPERIENCE", "1")
    return subprocess.call([str(executable), *sys.argv[1:]], env=env)


if __name__ == "__main__":
    sys.exit(main())
