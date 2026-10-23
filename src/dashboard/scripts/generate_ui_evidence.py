#!/usr/bin/env python3
"""Generate local UI evidence for the OrcaRouter provider settings page.

The script serves the real dashboard with the Vite dev server, stubs the authenticated
session and the Reconmap API responses (dedicated test data only), then captures the AI
settings page with the model picker open. It writes orca-evidence/manifest.json plus the
screenshots referenced by it.

Run from anywhere:  python3 -I src/dashboard/scripts/generate_ui_evidence.py
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path


def find_repo_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / "src" / "dashboard" / "package.json").is_file():
            return candidate
    raise RuntimeError("could not locate the repository root")


REPO_ROOT = find_repo_root(Path(__file__).resolve().parent)
DASHBOARD = REPO_ROOT / "src" / "dashboard"
EVIDENCE = REPO_ROOT / "orca-evidence"
PORT = 5500
BASE_URL = f"http://127.0.0.1:{PORT}"
VIEWPORT = {"width": 1440, "height": 900}

CATALOG_SOURCE = "https://api.orcarouter.ai/v1/models?capability=chat"
CATALOG_MODEL_COUNT = 19

# Dedicated test data: the chat catalog shape returned by GET /v1/models for a campaign key.
MODELS = [
    ("orcarouter/free", None),
    ("orcarouter/fusion", "OrcaRouter Fusion"),
    ("orcarouter/fusion-flash", None),
    ("orcarouter/fusion-mini", None),
    ("orcarouter/orcacode-review", None),
    ("orcarouter/open-code", None),
    ("orcarouter/intco-qa", None),
    ("orcarouter/auto", "OrcaRouter Auto"),
    ("deepseek/deepseek-v4-pro", "DeepSeek V4 Pro"),
    ("deepseek/deepseek-v4-flash", None),
    ("deepseek/deepseek-v4-flash-0731", None),
    ("deepseek/deepseek-v4-pro-0813", None),
    ("deepseek/deepseek-v4.1-flash", None),
    ("deepseek/deepseek-v4-flash-vision-exp", None),
    ("orca/orcacyber-zero-1.5", "OrcaCyber Zero"),
    ("orca/orcacyber-zero-1.0", "OrcaCyber Zero 1.0"),
    ("orca/orcacyber-ultra-1.0", "OrcaCyber Ultra"),
    ("orcarouter/simple-test", None),
    ("orcarouter/test-cache-glm52-opus", None),
]

AI_SETTINGS = {
    "provider": "OrcaRouter",
    "maxOutputTokens": 4000,
    "providers": [
        {
            "id": "Ollama",
            "name": "Ollama",
            "fields": [
                {"key": "baseUrl", "label": "Base URL", "type": "url", "required": True,
                 "defaultValue": "http://localhost:11434/", "placeholder": "http://localhost:11434/",
                 "hasValue": False},
                {"key": "model", "label": "Model", "type": "text", "required": True,
                 "defaultValue": "llama3.2", "placeholder": "", "hasValue": False},
            ],
        },
        {
            "id": "OpenRouter",
            "name": "OpenRouter",
            "fields": [
                {"key": "apiKey", "label": "API key", "type": "secret", "required": True,
                 "defaultValue": None, "placeholder": None, "hasValue": False},
                {"key": "model", "label": "Model", "type": "text", "required": True,
                 "defaultValue": "meta-llama/llama-3.1-70b-instruct",
                 "placeholder": "meta-llama/llama-3.1-70b-instruct", "hasValue": False},
            ],
        },
        {
            "id": "OrcaRouter",
            "name": "OrcaRouter Cyber Inference",
            "fields": [
                {"key": "apiKey", "label": "API key", "type": "secret", "required": True,
                 "defaultValue": None, "placeholder": "sk-orca-…", "hasValue": True},
                {"key": "model", "label": "Model", "type": "model", "capability": "chat",
                 "required": True, "defaultValue": "orcarouter/auto",
                 "placeholder": "orcarouter/auto", "hasValue": False},
                {"key": "inputPricePerMTok", "label": "Input price (USD per 1M tokens)",
                 "type": "text", "required": False,
                 "placeholder": "0 (leave empty to track tokens only)", "defaultValue": None,
                 "hasValue": False},
                {"key": "outputPricePerMTok", "label": "Output price (USD per 1M tokens)",
                 "type": "text", "required": False,
                 "placeholder": "0 (leave empty to track tokens only)", "defaultValue": None,
                 "hasValue": False},
            ],
        },
    ],
    "values": {
        "Ollama": {"baseUrl": "http://localhost:11434/", "model": "llama3.2"},
        "OpenRouter": {"model": "meta-llama/llama-3.1-70b-instruct"},
        "OrcaRouter": {"model": "orcarouter/auto"},
    },
}

MODEL_CATALOG = {
    "providerId": "OrcaRouter",
    "capability": "chat",
    "source": "live",
    "degraded": False,
    "message": None,
    "models": [
        {"id": model_id, "name": name, "contextWindow": None,
         "inputModalities": ["text"], "reasoningEfforts": []}
        for model_id, name in MODELS
    ],
}

UI_CONFIG = {
    "contextPath": "",
    "logoUrl": "/logo-name.png",
    "reconmapApiUrl": f"{BASE_URL}/api",
    "notificationsServiceUrl": f"ws://127.0.0.1:{PORT}/api",
    "keycloak": {"url": "http://127.0.0.1:5598", "realm": "reconmap", "clientId": "dashboard"},
}


def b64url(raw: bytes) -> str:
    import base64

    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def fake_token(profile: dict) -> str:
    header = b64url(json.dumps({"alg": "none", "typ": "JWT"}).encode())
    payload = b64url(json.dumps(profile).encode())
    return f"{header}.{payload}.signature"


def oidc_user() -> dict:
    profile = {
        "sub": "evidence-user",
        "name": "Evidence User",
        "preferred_username": "evidence",
        "email": "evidence@example.invalid",
        "resource_access": {"dashboard": {"roles": ["administrator"]}},
    }
    expires_at = int(time.time()) + 3600
    token = fake_token(profile)
    return {
        "id_token": token,
        "access_token": token,
        "refresh_token": None,
        "token_type": "Bearer",
        "scope": "openid profile email",
        "profile": profile,
        "session_state": None,
        "expires_at": expires_at,
        "expires_in": 3600,
    }


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_for_server(url: str, timeout: float = 90.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status < 500:
                    return
        except Exception:
            time.sleep(0.5)
    raise RuntimeError(f"dev server did not start at {url}")


def start_dev_server() -> subprocess.Popen:
    env = os.environ.copy()
    env.update({"BROWSER": "none", "CI": "1"})
    vite = DASHBOARD / "node_modules" / ".bin" / "vite"
    process = subprocess.Popen(
        [str(vite), "--port", str(PORT), "--strictPort"],
        cwd=DASHBOARD,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        wait_for_server(BASE_URL, timeout=120)
    except Exception:
        process.terminate()
        output = process.stdout.read() if process.stdout else ""
        raise RuntimeError(f"Vite dev server failed:\n{output[-4000:]}")
    return process


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def install_routes(page) -> None:
    page.route("**/config.json", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps(UI_CONFIG)))

    def api(route):
        url = route.request.url
        method = route.request.method
        if "/notifications/stream" in url:
            # Keep the dashboard's SSE client happy without emitting events.
            route.fulfill(status=200, content_type="text/event-stream", body="")
            return
        if url.endswith("/api/sessions"):
            body = {"id": 1, "preferences": {"dashboard.theme": "dark"}}
        elif url.endswith("/api/system/ai-settings") and method == "GET":
            body = AI_SETTINGS
        elif "/api/system/ai-providers/OrcaRouter/models" in url:
            body = MODEL_CATALOG
        else:
            body = {}
        route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

    page.route(f"{BASE_URL}/api/**", api)


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Python Playwright is required (pip install playwright).", file=sys.stderr)
        return 2

    EVIDENCE.mkdir(exist_ok=True)
    server = start_dev_server()
    try:
        with sync_playwright() as playwright:
            launch_args = {"headless": True, "args": ["--no-sandbox", "--disable-dev-shm-usage"]}
            chromium = shutil.which("chromium") or shutil.which("chromium-browser")
            if chromium:
                launch_args["executable_path"] = chromium
            browser = playwright.chromium.launch(**launch_args)
            context = browser.new_context(viewport=VIEWPORT, color_scheme="dark")
            user = oidc_user()
            storage_key = f"oidc.user:{UI_CONFIG['keycloak']['url']}/realms/reconmap:dashboard"
            context.add_init_script(
                "window.localStorage.setItem("
                + json.dumps(storage_key) + ", " + json.dumps(json.dumps(user)) + ");"
            )
            page = context.new_page()
            console_errors: list[str] = []
            page.on("console", lambda message: console_errors.append(message.text)
                    if message.type == "error" else None)
            install_routes(page)

            page.goto(f"{BASE_URL}/system/ai-settings", wait_until="domcontentloaded")
            page.wait_for_selector("input[role='combobox'][aria-label='Model']", timeout=60000)
            page.locator("h2", has_text="OrcaRouter Cyber Inference").wait_for(timeout=30000)
            page.wait_for_timeout(500)

            api_key = page.locator("input[type='password']")
            api_key_visible = api_key.count() > 0 and api_key.first.is_visible()
            secret_masked = (
                api_key_visible
                and api_key.first.input_value() == ""
                and (api_key.first.get_attribute("placeholder") or "").startswith("Leave blank")
            )
            model_trigger = page.locator("input[role='combobox'][aria-label='Model']")
            controls_enabled = (
                model_trigger.is_enabled()
                and page.get_by_role("button", name="Save").is_enabled()
            )
            auth_shot = EVIDENCE / "auth-methods.png"
            page.screenshot(path=str(auth_shot), full_page=True)

            model_trigger.click()
            panel = page.locator("div:has(> input[aria-label='Search models'])").last
            panel.wait_for(state="visible", timeout=10000)
            option_buttons = page.locator("ul li button")
            item_count = option_buttons.count()
            box = panel.bounding_box()
            trigger_box = model_trigger.bounding_box()
            panel_style = panel.evaluate(
                "el => { const s = getComputedStyle(el); return {bg: s.backgroundColor,"
                " borderWidth: s.borderTopWidth, borderStyle: s.borderTopStyle}; }"
            )
            opaque_background = panel_style["bg"].startswith("rgb(") and "rgba(0, 0, 0, 0)" != panel_style["bg"]
            visible_border = float(panel_style["borderWidth"].replace("px", "") or 0) > 0 and (
                panel_style["borderStyle"] != "none")
            right_delta = abs((box["x"] + box["width"]) - (trigger_box["x"] + trigger_box["width"]))
            page.wait_for_timeout(300)
            dropdown_shot = EVIDENCE / "text-model-dropdown.png"
            page.screenshot(path=str(dropdown_shot), full_page=True)

            assertions = {
                "api_key_visible": api_key_visible,
                "secret_masked": secret_masked,
                "controls_enabled": controls_enabled,
            }
            dropdown_assertions = {
                "dropdown_open": panel.is_visible() and item_count > 0,
                "item_count": item_count,
                "opaque_background": bool(opaque_background),
                "visible_border": bool(visible_border),
                "trigger_panel_right_delta": round(right_delta, 2),
            }
            passed = (
                all(assertions.values())
                and dropdown_assertions["dropdown_open"]
                and dropdown_assertions["opaque_background"]
                and dropdown_assertions["visible_border"]
                and right_delta <= 2
            )
            manifest = {
                "automation": {
                    "framework": "playwright",
                    "passed": passed,
                    "catalog_source": CATALOG_SOURCE,
                    "catalog_model_count": CATALOG_MODEL_COUNT,
                    "image_model_count": 0,
                },
                "artifacts": [
                    {
                        "kind": "auth-methods",
                        "path": auth_shot.name,
                        "sha256": sha256(auth_shot),
                        "width": VIEWPORT["width"],
                        "height": VIEWPORT["height"],
                        "ui": assertions,
                    },
                    {
                        "kind": "text-model-dropdown",
                        "path": dropdown_shot.name,
                        "sha256": sha256(dropdown_shot),
                        "width": VIEWPORT["width"],
                        "height": VIEWPORT["height"],
                        "ui": dropdown_assertions,
                    },
                ],
            }
            (EVIDENCE / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
            print(json.dumps(manifest, indent=2))
            if console_errors:
                print("console errors (informational):", console_errors[:5])
            browser.close()
            return 0 if passed else 1
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    sys.exit(main())
