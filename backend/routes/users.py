import hashlib
import re
from typing import Union
import psycopg

from datetime import datetime
from fastapi import APIRouter, HTTPException, Header

from models import User, Token, UserUpdate
from db import conn
from shared import decode_token, new_token

router = APIRouter()

EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")


@router.post("/admin/register")
def register(info: User):
    iat = int(datetime.now().timestamp())

    try:
        with conn.cursor() as cur:
            cur.execute(
                """ insert into users (email, password, role, iat)
                            values (%s, %s, %s, %s)
                            returning id""",
                (
                    info.email,
                    hashlib.sha256(info.password.encode()).hexdigest(),
                    info.role,
                    iat,
                ),
            )

            u_id = cur.fetchone()[0]
    except psycopg.IntegrityError as e:
        raise HTTPException(400, f"Email already exists")
    except Exception as e:
        raise HTTPException(500, f"Unknown error: {e}")

    return {
        "token": new_token(u_id, iat, info.role),
    }


@router.post("/admin/login")
def login(info: User):
    password = hashlib.sha256(info.password.encode()).hexdigest()

    if not EMAIL_REGEX.match(info.email):
        raise HTTPException(400, "Invalid email")

    iat = int(datetime.now().timestamp())

    with conn.cursor() as cur:
        cur.execute(
            "select id, password, role from users where email = %s", [info.email]
        )

        acc = cur.fetchone()

        if acc is None or password != acc[1]:
            raise HTTPException(400, "Invalid email or password")

        u_id = acc[0]
        role = acc[2]

        cur.execute("update users set iat=%s where id=%s", [iat, u_id])

    return {"token": new_token(u_id, iat, role)}


@router.post("/admin/logout")
def logout(token: Token):
    u_id, iat = decode_token(token.token)

    if u_id is not None and int(iat) != 0:
        try:
            with conn.cursor() as cur:
                cur.execute("update users set iat = 0 where id = %s", [u_id])
        except:
            raise HTTPException(500, "Could not log out")
    else:
        raise HTTPException(400, "Invalid token")

    return {}


@router.get("/admin/user/")
def get_user(authorization: Union[str, None] = Header(default=None)):
    if authorization is None:
        raise HTTPException(400, "Invalid token")

    u_id, iat = decode_token(authorization)

    res = {}

    if u_id is not None and int(iat) != 0:
        with conn.cursor() as cur:
            cur.execute("select email, role from users where id=%s", [u_id])

            data = cur.fetchone()

            if data is None:
                raise HTTPException(400, "Invalid token")

            res = {"email": data[0], "role": data[1]}
    else:
        raise HTTPException(400, "Invalid token")

    return res


@router.put("/admin/edit/user/")
def edit_user(info: UserUpdate, authorization: Union[str, None] = Header(default=None)):
    if authorization is None:
        raise HTTPException(400, "Invalid token")

    u_id, iat = decode_token(authorization)

    if u_id is not None and int(iat) != 0:
        with conn.cursor() as cur:
            if not info.new_password:
                cur.execute(
                    f"update users set (email, role) = (%s, %s) where id=%s",
                    [info.email, info.role, u_id],
                )
            else:
                password = hashlib.sha256(info.password.encode()).hexdigest()
                new_password = hashlib.sha256(info.new_password.encode()).hexdigest()

                cur.execute("select password from users where id=%s", [u_id])

                old_password = cur.fetchone()[0]

                if password != old_password:
                    raise HTTPException(400, "Old password is incorrect")

                cur.execute(
                    f"update users set (email, password, role) = (%s, %s, %s) where id=%s",
                    [info.email, new_password, info.role, u_id],
                )
    else:
        raise HTTPException(400, "Invalid token")

    return {}
