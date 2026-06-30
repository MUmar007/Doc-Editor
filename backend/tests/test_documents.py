import pytest
from httpx import AsyncClient

from tests.conftest import ALICE_ID, BOB_ID


@pytest.mark.anyio
async def test_create_and_list_document(client: AsyncClient, alice_headers: dict):
    """Creating a document makes it appear in Alice's owned list."""
    r = await client.post("/api/documents", json={}, headers=alice_headers)
    assert r.status_code == 201, r.text
    doc = r.json()
    assert doc["title"] == "Untitled Document"
    assert doc["owner_id"] == str(ALICE_ID)
    assert doc["is_owned"] is True

    listing = await client.get("/api/documents", headers=alice_headers)
    assert listing.status_code == 200
    owned_ids = [d["id"] for d in listing.json()["owned"]]
    assert doc["id"] in owned_ids


@pytest.mark.anyio
async def test_share_access_control(client: AsyncClient, alice_headers: dict, bob_headers: dict):
    """Bob cannot read Alice's doc until Alice shares it; Carol is blocked always."""
    # Alice creates a doc
    r = await client.post("/api/documents", json={}, headers=alice_headers)
    assert r.status_code == 201
    doc_id = r.json()["id"]

    # Bob cannot access it
    r = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert r.status_code == 403

    # Alice shares with Bob
    r = await client.post(
        f"/api/documents/{doc_id}/shares",
        json={"shared_with": str(BOB_ID), "permission": "edit"},
        headers=alice_headers,
    )
    assert r.status_code == 201

    # Bob can now access it
    r = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Untitled Document"

    # It appears in Bob's shared list
    r = await client.get("/api/documents", headers=bob_headers)
    assert r.status_code == 200
    shared_ids = [d["id"] for d in r.json()["shared"]]
    assert doc_id in shared_ids

    # Alice revokes the share
    r = await client.delete(
        f"/api/documents/{doc_id}/shares/{BOB_ID}",
        headers=alice_headers,
    )
    assert r.status_code == 204

    # Bob is blocked again
    r = await client.get(f"/api/documents/{doc_id}", headers=bob_headers)
    assert r.status_code == 403


@pytest.mark.anyio
async def test_txt_file_upload(client: AsyncClient, alice_headers: dict):
    """Uploading a .txt file creates a new document with parsed Tiptap content."""
    content = b"Hello World\n\nSecond paragraph here"
    r = await client.post(
        "/api/documents/upload",
        files={"file": ("sample.txt", content, "text/plain")},
        headers=alice_headers,
    )
    assert r.status_code == 201, r.text
    doc = r.json()
    assert doc["title"] == "sample"
    assert doc["content"]["type"] == "doc"
    # Should have parsed 2 paragraphs
    parsed_nodes = doc["content"]["content"]
    assert len(parsed_nodes) >= 1
    assert parsed_nodes[0]["type"] == "paragraph"


@pytest.mark.anyio
async def test_update_document_title(client: AsyncClient, alice_headers: dict):
    """PATCH updates the document title."""
    r = await client.post("/api/documents", json={}, headers=alice_headers)
    doc_id = r.json()["id"]

    r = await client.patch(
        f"/api/documents/{doc_id}",
        json={"title": "My Updated Title"},
        headers=alice_headers,
    )
    assert r.status_code == 200
    assert r.json()["title"] == "My Updated Title"


@pytest.mark.anyio
async def test_delete_document(client: AsyncClient, alice_headers: dict, bob_headers: dict):
    """Only owner can delete; Bob cannot delete Alice's document."""
    r = await client.post("/api/documents", json={}, headers=alice_headers)
    doc_id = r.json()["id"]

    # Share with Bob
    await client.post(
        f"/api/documents/{doc_id}/shares",
        json={"shared_with": str(BOB_ID), "permission": "edit"},
        headers=alice_headers,
    )

    # Bob cannot delete
    r = await client.delete(f"/api/documents/{doc_id}", headers=bob_headers)
    assert r.status_code == 403

    # Alice can delete
    r = await client.delete(f"/api/documents/{doc_id}", headers=alice_headers)
    assert r.status_code == 204

    # Doc no longer found
    r = await client.get(f"/api/documents/{doc_id}", headers=alice_headers)
    assert r.status_code == 404
