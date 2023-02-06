from db import conn
from fastapi import APIRouter, HTTPException

from models import Addon, Option
from shared import get_addons

router = APIRouter()


@router.get("/addons/{item_id}")
def get_item_addons(item_id):
    res = {}

    with conn.cursor() as cur:
        cur.execute("select * from items where id=%s", (item_id,))

        if not cur.rowcount:
            raise HTTPException(400, "Invalid item ID")

        addons = get_addons(cur, item_id)

    res["addons"] = addons

    return res


@router.post("/addons")
def add_addon(addon: Addon):
    addon_id = 0

    with conn.cursor() as cur:
        addon_id = create_addon(addon, cur)

    return {"id": addon_id}


def create_addon(addon: Addon, cur):
    addon_id = ""

    try:
        cur.execute(
            "insert into addons (item, multiselect, title) values(%s, %s, %s) returning id",
            (addon.item, addon.multiselect, addon.title),
        )

        addon_id = cur.fetchone()[0]

        for option in addon.options:
            update_option(addon_id, option)

    except Exception as e:
        raise HTTPException(500, f"Could not create addon {e}")

    return addon_id


@router.put("/addons/{addon_id}")
def update_addon(addon_id, addon: Addon):
    try:
        with conn.cursor() as cur:
            cur.execute(
                "update addons set title=%s, multiselect=%s where id=%s",
                (addon.title, addon.multiselect, addon_id),
            )

            for option in addon.options:
                update_option(addon_id, option)
    except:
        raise HTTPException(500, f"Could not update addon {addon_id}")

    return {}


@router.delete("/addons/{addon_id}")
def delete_addon(addon_id):
    try:
        with conn.cursor() as cur:
            cur.execute("delete from addon_options where addon=%s", (addon_id,))
            cur.execute("delete from addons where id=%s", (addon_id,))
    except:
        raise HTTPException(500, f"Could not delete addon {addon_id}")

    return {}


@router.delete("/options/{addon_id}")
def delete_option(addon_id, option: Option):
    try:
        with conn.cursor() as cur:
            cur.execute(
                "delete from addon_options where addon=%s and name=%s and price=%s",
                (addon_id, option.name, option.price),
            )
    except:
        raise HTTPException(500, f"Could not delete addon {addon_id}")

    return {}


def update_option(addon, option: Option, update=True):
    with conn.cursor() as cur:
        if update:
            cur.execute(
                "select * from addon_options where addon=%s and name=%s and price=%s",
                (addon, option.name, option.price),
            )

        if update and cur.rowcount:
            cur.execute(
                "update addon_options set name=%s, price=%s where addon=%s and name=%s and price=%s",
                (option.name, option.price, addon, option.name, option.price),
            )
        else:
            cur.execute(
                "insert into addon_options(addon, name, price) values(%s, %s, %s)",
                (addon, option.name, option.price),
            )
