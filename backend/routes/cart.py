from db import conn
from fastapi import APIRouter, HTTPException

from models import CartItem
from shared import get_addons

router = APIRouter()

# Returns a list of all the items in the cart for a table number including the item image, name, addons, quantity and price
@router.get("/cart/{table_id}")
def get_cart(table_id: int):
    cart = {"cart": []}
    total_price = 0

    with conn.cursor() as cur:
        cur.execute(
            """ select io.id, io.item, io.amount, i.name, i.img, i.price 
                        from item_orders io 
                        left join items i on io.item = i.id 
                        where io.table_number=%s and io.order_status='cart'
                    """,
            (table_id,),
        )

        for item in cur.fetchall():
            item_price = item[5]

            addons, addon_cost = get_addons(cur, item[1], True, item[0])

            item_price = (item_price + addon_cost) * item[2]

            total_price += item_price

            addon_obj = {}

            for addon in addons:
                options = []

                for option in addon["options"]:
                    if option["checked"]:
                        options.append(option["name"])

                addon_obj[addon["title"]] = options

            cart["cart"].append(
                {
                    "cart_id": item[0],
                    "id": item[1],
                    "name": item[3],
                    "addons": addon_obj,
                    "price": item_price,
                    "quantity": item[2],
                }
            )

        cart["total_price"] = round(total_price, 2)
    return cart


# Returns the details of an item in a cart including the id, name, addons, price, description and quantity
@router.get("/cart/item/{item_order_id}")
def get_cart_item(item_order_id: int):
    cart_item = {}

    with conn.cursor() as cur:
        cur.execute(
            """ select io.item, io.amount, i.name, i.price, i.description 
                        from item_orders io 
                        left join items i on io.item = i.id 
                        where io.id = %s
                    """,
            (item_order_id,),
        )

        if not cur.rowcount:
            raise HTTPException(400, "Invalid cart item ID")

        item = cur.fetchone()

        addons, addon_cost = get_addons(cur, item[0], True, item_order_id)

        item_price = item[3] + addon_cost
        item_price = round(item_price, 2)

        cart_item = {
            "name": item[2],
            "addons": addons,
            "price": item_price,
            "description": item[4],
            "quantity": item[1],
            "id": item[0],
        }

    return cart_item


# Adds an item with a given quantity and addons to the cart for a table number
@router.post("/cart/{table_id}")
async def add_cart_item(table_id: int, cartItem: CartItem):
    with conn.cursor() as cur:
        cur.execute(
            "insert into item_orders(table_number, item, amount, order_status) values(%s, %s, %s, %s) returning id",
            (table_id, cartItem.item, cartItem.amount, "cart"),
        )
        cartItemID = cur.fetchone()[0]

        if cartItem.addons is not None:

            for addon in cartItem.addons:
                cur.execute(
                    "insert into addon_orders(item, addon) values(%s, %s) returning id",
                    (cartItemID, addon),
                )
                addonID = cur.fetchone()[0]

                for addonoption in cartItem.addons[addon]:
                    cur.execute(
                        "insert into addon_options_orders (addon, addon_option) values(%s, %s)",
                        (addonID, addonoption),
                    )

    return {}


# Updates the quantity and addons for an item in the cart based on a given cart item id
@router.put("/cart/{cart_item_id}")
async def update_cart_item(cart_item_id: int, cartItem: CartItem):
    with conn.cursor() as cur:

        cur.execute(
            "update item_orders set amount=%s where id = %s",
            (cartItem.amount, cart_item_id),
        )
        cur.execute("delete from addon_orders where item=%s", (cart_item_id,))

        for addon in cartItem.addons:
            cur.execute(
                "insert into addon_orders(item, addon) values(%s, %s) returning id",
                (cart_item_id, addon),
            )
            addonID = cur.fetchone()[0]

            for addonoption in cartItem.addons[addon]:
                cur.execute(
                    "insert into addon_options_orders (addon, addon_option) values(%s, %s)",
                    (addonID, addonoption),
                )

    return {}


# Deletes an item from the cart based on a given cart item id
@router.delete("/cart/{cart_item_id}")
def del_cart_item(cart_item_id: int):
    with conn.cursor() as cur:
        cur.execute("delete from item_orders where id=%s", (cart_item_id,))

    return {}


# Returns the total number of items in the cart for a table number
@router.get("/cart/{table_id}/no_items")
def get_no_cart_items(table_id: int):
    with conn.cursor() as cur:
        no_items = 0
        cur.execute(
            "select amount from item_orders where table_number=%s and order_status='cart'",
            (table_id,),
        )
        for item in cur.fetchall():
            no_items += item[0]
        return {"no_items": no_items}


# Deletes all the ordered items for a given table number
@router.delete("/{table_id}/order-history")
def delete_ordered_items(table_id: int):
    with conn.cursor() as cur:
        cur.execute("delete from item_orders where table_number=%s", (table_id,))

    return {"status": "ok"}
