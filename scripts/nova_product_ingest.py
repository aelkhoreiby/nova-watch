#!/usr/bin/env python3
"""
NOVA local product inbox worker.

Default inbox:
  ~/Desktop/NOVA Products

Accepted file naming:
  Product Name - 249.jpg
  Product Name - 249 - 199.jpg
  Product Name.jpg            -> draft only; price is required to publish

Optional sidecar JSON:
  Product Name.json
  {
    "name": "NOVA Watch Name",
    "price": 249,
    "sale_price": 199,
    "description": "Verified product description",
    "quantity": 1,
    "track_stock": true
  }

The worker is intentionally conservative:
- it never invents technical specifications
- it requires a price before publishing
- it uses public raw.githubusercontent.com URLs for product images
- it records every result in product-queue/
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
REPO = os.environ.get("GITHUB_REPOSITORY", "aelkhoreiby/nova-watch")
BRANCH = os.environ.get("GITHUB_REF_NAME", "main")
RAW_BASE = os.environ.get(
    "NOVA_PUBLIC_IMAGE_BASE",
    f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/public/products/incoming",
)
DEFAULT_INBOX = (Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Desktop" / "NOVA Products") if os.name == "nt" else (Path.home() / "Desktop" / "NOVA Products")
INBOX = Path((os.environ.get("NOVA_PRODUCT_INBOX") or str(DEFAULT_INBOX))).expanduser()
PROCESSED = INBOX / "Processed"
NEEDS_INFO = INBOX / "Needs-Info"
QUEUE_DIR = Path("product-queue")
MEDIA_DIR = Path("public/products/incoming")
API_URL = "https://api.easy-orders.net/api/v1/external-apps/products"
API_KEY = os.environ.get("NOVA_EASY_ORDERS_API_KEY") or os.environ.get("EASY_ORDERS_API_KEY")
AUTO_PUBLISH = os.environ.get("NOVA_AUTO_PUBLISH", "true").lower() in {"1", "true", "yes"}
DEFAULT_CURRENCY = os.environ.get("NOVA_PRODUCT_CURRENCY", "AED")
DEFAULT_QUANTITY = int(os.environ.get("NOVA_DEFAULT_QUANTITY", "1"))


def log(message: str) -> None:
    print(f"[NOVA PRODUCT] {message}", flush=True)


def slug_suffix(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()[:10]


def clean_name(filename: str) -> str:
    stem = Path(filename).stem
    stem = re.sub(r"\s+", " ", stem).strip()
    stem = re.sub(r"\s+-\s+\d+(?:\.\d+)?(?:\s+-\s+\d+(?:\.\d+)?)?\s*$", "", stem)
    return stem or "NOVA Product"


def numbers_from_name(filename: str) -> list[float]:
    stem = Path(filename).stem.replace(",", "")
    nums = re.findall(r"(?<!\w)(\d+(?:\.\d+)?)(?!\w)", stem)
    values: list[float] = []
    for raw in nums[-2:]:
        try:
            values.append(float(raw))
        except ValueError:
            pass
    return values


def sidecar_for(image: Path) -> Path:
    return image.with_suffix(".json")


def read_sidecar(image: Path) -> dict[str, Any]:
    sidecar = sidecar_for(image)
    if not sidecar.exists():
        return {}
    payload = json.loads(sidecar.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"sidecar {sidecar.name} must contain an object")
    return payload


def product_from_image(image: Path) -> dict[str, Any]:
    raw = image.read_bytes()
    sidecar = read_sidecar(image)
    values = numbers_from_name(image.name)

    name = str(sidecar.get("name") or clean_name(image.name)).strip()
    price = sidecar.get("price")
    sale_price = sidecar.get("sale_price")

    if price is None and values:
        price = values[-2] if len(values) == 2 else values[-1]
    if sale_price is None and len(values) == 2:
        sale_price = values[-1]

    price = float(price) if price is not None else None
    sale_price = float(sale_price) if sale_price is not None else None

    suffix = slug_suffix(raw)
    slug = f"nova-{suffix}"
    repo_name = f"{slug}{image.suffix.lower()}"
    local_media_dir = MEDIA_DIR / slug
    local_media_dir.mkdir(parents=True, exist_ok=True)
    target = local_media_dir / repo_name
    shutil.copy2(image, target)

    public_url = f"{RAW_BASE}/{urllib.parse.quote(slug)}/{urllib.parse.quote(repo_name)}"

    description = str(
        sidecar.get("description")
        or (
            f"{name}. "
            "Product shown in the supplied NOVA product image. "
            "Contact NOVA for current availability and product details."
        )
    ).strip()

    quantity = int(sidecar.get("quantity", DEFAULT_QUANTITY))
    track_stock = bool(sidecar.get("track_stock", quantity > 0))
    disable_orders_for_no_stock = bool(
        sidecar.get("disable_orders_for_no_stock", False)
    )

    return {
        "name": name,
        "price": price,
        "sale_price": sale_price,
        "description": description,
        "slug": slug,
        "sku": slug.upper().replace("-", "_"),
        "thumb": public_url,
        "images": [public_url],
        "quantity": quantity,
        "track_stock": track_stock,
        "disable_orders_for_no_stock": disable_orders_for_no_stock,
        "currency": DEFAULT_CURRENCY,
        "source_file": str(image),
        "repo_image": str(target).replace("\\", "/"),
        "public_image_url": public_url,
    }


def write_manifest(product: dict[str, Any], status: str, response: Any = None) -> Path:
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    record = {
        **product,
        "status": status,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if response is not None:
        record["easy_orders_response"] = response
    path = QUEUE_DIR / f"{product['slug']}.json"
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def wait_for_public_image(url: str, attempts: int = 18) -> None:
    request = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "NOVA-Product-Worker/1.0"},
    )
    last_error = ""
    for _ in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                if 200 <= response.status < 400:
                    log(f"Public image ready: {url}")
                    return
                last_error = f"HTTP {response.status}"
        except Exception as exc:
            last_error = str(exc)
        time.sleep(5)
    raise RuntimeError(f"Public image was not reachable after publish: {last_error}")


def create_easy_orders_product(product: dict[str, Any]) -> dict[str, Any]:
    if not API_KEY:
        raise RuntimeError("NOVA_EASY_ORDERS_API_KEY is not configured.")
    if product["price"] is None:
        raise RuntimeError("Price is required before publishing.")

    body: dict[str, Any] = {
        "name": product["name"],
        "price": product["price"],
        "description": product["description"],
        "slug": product["slug"],
        "sku": product["sku"],
        "thumb": product["thumb"],
        "images": product["images"],
        "quantity": product["quantity"],
        "track_stock": product["track_stock"],
        "disable_orders_for_no_stock": product["disable_orders_for_no_stock"],
    }

    if product["sale_price"] is not None:
        body["sale_price"] = product["sale_price"]

    request = urllib.request.Request(
        API_URL,
        method="POST",
        headers={
            "Api-Key": API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "NOVA-Product-Worker/1.0",
        },
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            payload = response.read().decode("utf-8")
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                data = {"raw": payload}
            return {"status": response.status, "data": data}
    except urllib.error.HTTPError as exc:
        body_text = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"EasyOrders create failed: HTTP {exc.code}: {body_text[:800]}"
        ) from exc


def archive(image: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    target = destination / image.name
    shutil.move(str(image), str(target))
    sidecar = sidecar_for(image)
    if sidecar.exists():
        shutil.move(str(sidecar), str(destination / sidecar.name))


def scan() -> int:
    INBOX.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)
    NEEDS_INFO.mkdir(parents=True, exist_ok=True)

    images = sorted(
        p
        for p in INBOX.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not images:
        log(f"No new images in {INBOX}")
        return 0

    changed = 0
    for image in images:
        log(f"Processing {image.name}")
        try:
            product = product_from_image(image)
            if product["price"] is None:
                manifest = write_manifest(product, "needs-price")
                archive(image, NEEDS_INFO)
                log(f"Needs price: {manifest}")
                changed += 1
                continue

            write_manifest(product, "image-staged")
            log("Image staged; repository commit must happen before EasyOrders can fetch it.")
            changed += 1
        except Exception as exc:
            log(f"ERROR {image.name}: {exc}")
            write_manifest(
                {
                    "name": clean_name(image.name),
                    "price": None,
                    "sale_price": None,
                    "description": "",
                    "slug": f"nova-error-{slug_suffix(image.read_bytes())}",
                    "sku": "",
                    "thumb": "",
                    "images": [],
                    "quantity": 0,
                    "track_stock": False,
                    "disable_orders_for_no_stock": False,
                    "currency": DEFAULT_CURRENCY,
                    "source_file": str(image),
                    "repo_image": "",
                    "public_image_url": "",
                },
                "error",
            )
    return changed


def publish_staged() -> int:
    if not AUTO_PUBLISH:
        return 0

    manifests = sorted(QUEUE_DIR.glob("*.json")) if QUEUE_DIR.exists() else []
    published = 0
    for manifest_path in manifests:
        record = json.loads(manifest_path.read_text(encoding="utf-8"))
        if record.get("status") != "image-staged":
            continue

        try:
            wait_for_public_image(record["public_image_url"])
            response = create_easy_orders_product(record)
            record["status"] = "published"
            record["easy_orders_response"] = response
            record["published_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            manifest_path.write_text(
                json.dumps(record, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            source = Path(record["source_file"])
            if source.exists():
                archive(source, PROCESSED)
            published += 1
            log(f"Published: {record['name']} -> {record['slug']}")
        except Exception as exc:
            record["status"] = "publish-failed"
            record["error"] = str(exc)
            manifest_path.write_text(
                json.dumps(record, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            log(f"Publish failed for {record.get('name')}: {exc}")
    return published


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "scan"
    if mode == "scan":
        processed = scan()
        log(f"Scan complete: {processed} item(s) handled.")
        raise SystemExit(0)
    if mode == "publish":
        published = publish_staged()
        log(f"Publish complete: {published} product(s) published.")
        raise SystemExit(0)
    if mode == "all":
        processed = scan()
        published = publish_staged()
        log(f"All complete: {processed} item(s) handled, {published} product(s) published.")
        raise SystemExit(0)
    print("Usage: nova_product_ingest.py [scan|publish|all]")
    raise SystemExit(2)
