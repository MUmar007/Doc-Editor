import json
import uuid
from collections import defaultdict

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.auth import decode_access_token
from app.database import AsyncSessionLocal
from app.models.user import User as UserModel

router = APIRouter(tags=["presence"])

# In-memory presence store — single-process only (fine for Railway single instance)
# doc_id -> {user_id -> {"display_name": str, "color": str}}
_rooms: dict[str, dict[str, dict[str, str]]] = defaultdict(dict)
# doc_id -> {user_id -> WebSocket}
_connections: dict[str, dict[str, WebSocket]] = defaultdict(dict)


def _user_color(user_id: str) -> str:
    palette = [
        "#F44336", "#2196F3", "#4CAF50", "#FF9800",
        "#9C27B0", "#00BCD4", "#FF5722", "#E91E63",
    ]
    # sum of char codes — deterministic across Python restarts and matches the JS side
    return palette[sum(ord(c) for c in user_id) % len(palette)]


async def _broadcast(doc_id: str, message: dict, exclude: str | None = None) -> None:
    dead: list[str] = []
    for uid, ws in list(_connections[doc_id].items()):
        if uid == exclude:
            continue
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.append(uid)
    for uid in dead:
        _rooms[doc_id].pop(uid, None)
        _connections[doc_id].pop(uid, None)


@router.websocket("/api/documents/{doc_id}/presence")
async def presence_ws(
    doc_id: str,
    websocket: WebSocket,
    token: str = Query(...),
) -> None:
    try:
        user_id = str(decode_access_token(token))
    except Exception:
        await websocket.close(code=4001)
        return

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.id == uuid.UUID(user_id))
        )
        user = result.scalar_one_or_none()

    if user is None:
        await websocket.close(code=4001)
        return

    display_name: str = user.display_name
    color = _user_color(user_id)

    await websocket.accept()
    _rooms[doc_id][user_id] = {"display_name": display_name, "color": color}
    _connections[doc_id][user_id] = websocket

    # Send the current room state to the newcomer
    await websocket.send_text(
        json.dumps({
            "type": "presence_list",
            "users": [
                {"user_id": uid, **info}
                for uid, info in _rooms[doc_id].items()
                if uid != user_id
            ],
        })
    )

    # Announce arrival to everyone else
    await _broadcast(
        doc_id,
        {"type": "joined", "user_id": user_id, "display_name": display_name, "color": color},
        exclude=user_id,
    )

    try:
        while True:
            await websocket.receive_text()
            # Client sent a heartbeat ping — reply with the current room state so
            # the client self-corrects if it missed any join/leave events
            await websocket.send_text(
                json.dumps({
                    "type": "presence_list",
                    "users": [
                        {"user_id": uid, **info}
                        for uid, info in _rooms[doc_id].items()
                        if uid != user_id
                    ],
                })
            )
    except WebSocketDisconnect:
        pass
    finally:
        _rooms[doc_id].pop(user_id, None)
        _connections[doc_id].pop(user_id, None)
        await _broadcast(doc_id, {"type": "left", "user_id": user_id})
        if not _rooms[doc_id]:
            del _rooms[doc_id]
        if not _connections[doc_id]:
            del _connections[doc_id]
