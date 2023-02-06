import json
import os
from typing import Optional
from db import conn
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models import Addon, ItemID, OrderedItems
from routes.addons import create_addon
from shared import get_addons

router = APIRouter()

# Returns all the menu items including the id, name, description, price, category, order and availability of an item
@router.get("/menu", tags=["Home"])
def get_menu():
    categories = {}

    with conn.cursor() as cur:
        cur.execute(
            """ select i.id, i.name, i.description, i.price, 
                        c.name category, i.ord iOrd, c.ord cOrd, i.available ava 
                        from items i 
                        join categories c on i.category=c.id 
                        order by cord, iord
                    """
        )

        for cat in cur:
            if cat[4] not in categories.keys():
                categories[cat[4]] = []

            if cat[7]:
                categories[cat[4]].append(
                    {"id": cat[0], "name": cat[1], "desc": cat[2], "price": cat[3]}
                )

    return categories


# Returns all the items and categories added by the manager
@router.get("/items")
def get_all_items():
    items = {"items": [], "categories": []}

    with conn.cursor() as cur:
        cur.execute(
            "select *, c.id from items i join categories c on i.category = c.id order by c.ord, i.ord"
        )

        for item in cur:
            items["items"].append(
                {
                    "id": item[0],
                    "name": item[1],
                    "description": item[3],
                    "price": item[5],
                    "availability": item[6],
                    "ord": item[7],
                    "category_id": item[8],
                }
            )

        # Store all categories of all current items
        category_ids = []
        for item in items["items"]:
            if item["category_id"] not in category_ids:
                category_ids.append(item["category_id"])

        cur.execute("select c.id, c.name from categories c order by c.ord")

        # Add categories that have at least 1 item in them
        for category in cur:
            if category[0] in category_ids:
                items["categories"].append(
                    {"id": category[0], "name": category[1].replace("\n", "")}
                )

    return items


@router.get("/items/{category_id}")
def get_items(category_id: int):
    items = {"items": []}

    with conn.cursor() as cur:
        cur.execute(
            "select * from items where category=%s order by ord", (category_id,)
        )

        if not cur.rowcount:
            raise HTTPException(400, "Invalid category ID")

        for item in cur:
            items["items"].append(
                {
                    "id": item[0],
                    "name": item[1],
                    "description": item[3],
                    "price": item[5],
                    "availability": item[6],
                    "ord": item[7],
                }
            )

    return items


@router.get("/item/{item_id}")
def get_item_info(item_id: int):
    item = {}

    with conn.cursor() as cur:
        cur.execute("select * from items where id=%s", (item_id,))

        if not cur.rowcount:
            raise HTTPException(400, "Invalid item ID")

        data = cur.fetchone()

        addons = get_addons(cur, item_id)

        cur.execute("select name from categories where id=%s", (data[4],))
        categoryName = cur.fetchone()[0]

        cur.execute("select ingredient from item_ingredients where item=%s", (data[0],))

        ingredients_ids = []
        ingredient_names = []

        if cur.rowcount != 0:
            for i in cur:
                ingredients_ids.append(i[0])

            for ii in ingredients_ids:
                cur.execute("select name from ingredients where id=%s", (ii,))
                ingredient_names.append({"id": ii, "name": cur.fetchone()[0]})

        item = {
            "id": data[0],
            "name": data[1],
            "category": categoryName,
            "category_id": data[4],
            "description": data[3],
            "price": data[5],
            "availability": data[6],
            "ord": data[7],
            "addons": addons,
            "ingredients": ingredient_names,
        }

    return item


@router.post("/items")
async def add_item(
    name: str = Form(),
    category: str = Form(),
    price: str = Form(),
    available: str = Form(),
    description: str = Form(),
    img: Optional[UploadFile] = File(default=None),
    ingredients: str = Form(),
    addons: str = Form(),
):
    with conn.cursor() as cur:
        cur.execute(
            "insert into items(name, category, price, available, description) values(%s, %s, %s, %s, %s) returning id",
            (name, category, price, available, description),
        )

        item_id = cur.fetchone()[0]

        cur.execute("update items set ord = %s where id = %s", (item_id, item_id))

        if img is not None:
            with open(f"./img/{item_id}", "wb") as f:
                f.write(img.file.read())

        with cur.copy("copy item_ingredients (item, ingredient) from stdin") as copy:
            for id in json.loads(ingredients)["ingredients"]:
                copy.write_row((item_id, id))

        for addon in json.loads(addons)["addons"]:
            create_addon(
                Addon(
                    item=item_id,
                    title=addon["title"],
                    multiselect=addon["type"],
                    options=addon["options"],
                ),
                cur,
            )

    return {}


@router.put("/items")
async def update_item(
    name: str = Form(),
    category: str = Form(),
    price: str = Form(),
    available: str = Form(),
    description: str = Form(),
    img: Optional[UploadFile] = File(default=None),
    ingredients: str = Form(),
    item: str = Form(),
):

    with conn.cursor() as cur:
        cur.execute(
            "update items set name=%s, category=%s, price=%s, available=%s, description=%s where id=%s",
            (name, category, price, available, description, item),
        )

        if img is not None:
            with open(f"./img/{item}", "wb") as f:
                f.write(img.file.read())

        cur.execute("select ingredient from item_ingredients where item=%s", (item,))

        pairs = []

        for pair in cur:
            pairs.append(pair[0])

        new = []
        for ingredient in json.loads(ingredients)["ingredients"]:
            if ingredient not in pairs:
                new.append((item, ingredient))

        with cur.copy("copy item_ingredients (item, ingredient) from stdin") as copy:
            for tup in new:
                copy.write_row(tup)

    return {}


# Updates the order in which items are shown in each category on the customer menu
@router.put("/item_order")
async def update_item_order(ordered_items: OrderedItems):
    with conn.cursor() as cur:
        for i, item in enumerate(ordered_items.ordered_items):
            cur.execute("update items set ord=%s where id=%s", (i, item.id))

    return {}


@router.delete("/items")
def delete_item(id: ItemID):
    with conn.cursor() as cur:
        cur.execute("delete from item_ingredients where item=%s", (id.id,))
        cur.execute("delete from items where id=%s", (id.id,))
        if os.path.exists(f"./img/{id.id}"):
            os.remove(f"./img/{id.id}")

    return {}
