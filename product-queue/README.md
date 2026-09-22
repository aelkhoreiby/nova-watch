# NOVA Product Queue

This directory is the audit trail for the Desktop → EasyOrders product pipeline.

Status values:
- `image-staged` — image is committed and waiting for public URL verification / publish.
- `needs-price` — source image was found but no price was supplied.
- `published` — EasyOrders accepted the product creation request.
- `publish-failed` — the product was not created; inspect the `error` field.

The worker never invents technical specifications.
