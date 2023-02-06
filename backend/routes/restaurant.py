import re
from typing import Optional, Union
from fastapi import APIRouter, File, Form, HTTPException, Header, UploadFile
from db import conn
from shared import decode_token

router = APIRouter()

# Returns the name of the restaurant
@router.get("/restaurant")
def get_restaurant():
    res = {}

    with conn.cursor() as cur:
        cur.execute("select name from restaurant_info")

        data = cur.fetchone()

        res = {"name": data[0]}

    return res


# Updates the name and logo of the restaurant
@router.put("/admin/edit/restaurant")
def edit_restaurant(
    name: str = Form(),
    logo: Optional[UploadFile] = File(default=None),
    authorization: Union[str, None] = Header(default=None),
):
    if authorization is None or (
        logo is not None and not re.match("image/.*", logo.content_type)
    ):
        raise HTTPException(453, "nuh uh")

    u_id, iat = decode_token(authorization)

    if u_id is not None and int(iat) != 0:
        if logo is not None:
            with open("./img/logo", "wb") as f:
                f.write(logo.file.read())

        try:
            with conn.cursor() as cur:
                cur.execute(f"update restaurant_info set name = %s", [name])
        except:
            raise HTTPException(400, "Could not update restaurant")
    else:
        raise HTTPException(400, "Invalid token")

    return {}
