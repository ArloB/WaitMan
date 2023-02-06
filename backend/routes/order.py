from db import conn
from fastapi import APIRouter, HTTPException

from models import CouponCode, CouponID
from shared import get_addons

router = APIRouter()

# Returns a list of all the ordered items for a given table number
@router.get("/{table_id}/order-history")
def get_order_history(table_id: int):
    order_history = {"order_history": []}
    total_price = 0

    with conn.cursor() as cur:
        cur.execute(
            """ select io.id, io.item, io.amount, i.name, i.img, i.price 
                        from item_orders io 
                        left join items i on io.item = i.id 
                        where table_number=%s and order_status='ordered'
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

            order_history["order_history"].append(
                {
                    "id": item[1],
                    "name": item[3],
                    "addons": addon_obj,
                    "price": item_price,
                    "quantity": item[2],
                }
            )

        order_history["total_price"] = total_price

        cur.execute(
            """ select c.id, c.code, c.description, c.type, 
                        c.discount, c.minimum, c.item, i.price
                        from order_coupons oc 
                        join coupons c on oc.coupon = c.id 
                        left join items i on i.id = c.item
                        where oc.table_number=%s
                    """,
            (table_id,),
        )

        data = cur.fetchone()

        order_history["coupon"] = (
            {
                "id": data[0],
                "code": data[1],
                "description": data[2],
                "type": data[3],
                "discount": data[7] - data[4] if data[3] == 2 else data[4],
                "minimum": data[5],
                "item": data[6],
            }
            if data
            else {}
        )

    return order_history


# Deletes all the ordered items for a given table number
@router.delete("/{table_id}/order-history")
def delete_ordered_items(table_id: int):
    with conn.cursor() as cur:
        cur.execute("delete from item_orders where table_number=%s", (table_id,))

    return {}


# Requests the bill and returns a list of all the ordered items along with the total price
@router.post("/{table_id}/bill/{viewing}")
def request_bill(table_id: int, viewing: str):
    bill = {"bill": []}
    total_price = 0

    with conn.cursor() as cur:
        if viewing != "wait":
            cur.execute(
                "update item_orders set order_status='bill' where table_number=%s and order_status='ordered'",
                (table_id,),
            )

        cur.execute(
            """ select c.code, c.type, 
                        c.discount, c.item, c.one_time, i.price, c.id
                        from order_coupons oc 
                        join coupons c on oc.coupon = c.id 
                        left join items i on i.id = c.item
                        where oc.table_number=%s
                    """,
            (table_id,),
        )

        coupon = cur.fetchone()

        if coupon:
            bill["coupon"] = (
                {
                    "code": coupon[0],
                    "type": coupon[1],
                    "discount": coupon[5] - coupon[2] if coupon[1] == 2 else coupon[2],
                    "item": coupon[3],
                }
                if coupon
                else {}
            )

            if coupon[4] and viewing != "wait":
                cur.execute(
                    """ update coupons set active=false, code=''
                                where id = %s
                                """,
                    [coupon[6]],
                )

        cur.execute(
            """ select io.id, io.item, io.amount, i.name, i.img, i.price 
                        from item_orders io 
                        left join items i on io.item = i.id 
                        where table_number=%s and order_status='bill'
                    """,
            (table_id,),
        )

        for item in cur.fetchall():
            addons = {}
            item_price = item[5]

            cur.execute(
                """ select a.id, aa.id, aa.title 
                            from addon_orders a 
                            left join item_orders i on a.addon=i.id 
                            left join addons aa on a.addon=aa.id 
                            where a.item=%s
                        """,
                (item[0],),
            )

            for addon in cur.fetchall():
                options = []

                cur.execute(
                    """ select o.price, o.name 
                                from addon_options_orders a 
                                join addon_options o 
                                on a.addon_option = o.name 
                                where a.addon=%s and o.addon=%s
                            """,
                    (addon[0], addon[1]),
                )

                for addonoption in cur.fetchall():
                    options.append(addonoption[1])
                    item_price += addonoption[0]

                addons["name"] = addon[2]
                addons["options"] = options

            item_price = item_price * item[2]

            total_price += item_price

            bill["bill"].append(
                {
                    "name": item[3],
                    "addons": addons,
                    "price": item_price,
                    "quantity": item[2],
                    "id": item[1],
                }
            )

            bill["total_price"] = total_price

    return bill


# Places an order for items in cart
@router.put("/order/{table_id}/place-order")
def place_order(table_id: int):
    with conn.cursor() as cur:
        cur.execute(
            "update item_orders set order_status='ordered' where table_number=%s and order_status='cart'",
            (table_id,),
        )

    return {}


@router.put("/order/{table_id}/coupon")
def add_coupon_to_order(table_id: int, coupon_id: CouponID):
    res = {}

    with conn.cursor() as cur:
        cur.execute(
            """ insert into order_coupons (table_number, coupon) 
                        values (%s, %s) on conflict (table_number, coupon) 
                            do update set coupon = EXCLUDED.coupon""",
            (table_id, coupon_id.id),
        )

        cur.execute(
            """ select c.id, c.code, c.description, c.type, 
                        c.discount, c.minimum, c.item, i.price
                        from coupons c
                        left join items i on i.id = c.item
                        where c.id = %s
                        """,
            (coupon_id.id,),
        )

        data = cur.fetchone()

        res = (
            {
                "id": data[0],
                "code": data[1],
                "description": data[2],
                "type": data[3],
                "discount": data[7] - data[4] if data[3] == 2 else data[4],
                "minimum": data[5],
                "item": data[6],
            }
            if data
            else {}
        )

    return res


@router.put("/order/{table_id}/coupon/private")
def add_priv_coupon_to_order(table_id: int, coupon_code: CouponCode):
    res = {}

    with conn.cursor() as cur:
        cur.execute(
            """ select c.id, c.code, c.description, c.type, 
                        c.discount, c.minimum, c.item, i.price
                        from coupons c
                        left join items i on i.id = c.item
                        where c.code=%s""",
            (coupon_code.code,),
        )

        if not cur.rowcount:
            raise HTTPException(400, "Coupon code is not valid")

        data = cur.fetchone()

        res = (
            {
                "id": data[0],
                "code": data[1],
                "description": data[2],
                "type": data[3],
                "discount": data[7] - data[4] if data[3] == 2 else data[4],
                "minimum": data[5],
                "item": data[6],
            }
            if data
            else {}
        )

        cur.execute(
            """ insert into order_coupons (table_number, coupon) 
                        values (%s, %s) on conflict (table_number, coupon) 
                            do update set coupon = EXCLUDED.coupon""",
            (table_id, data[0]),
        )

    return res


@router.delete("/order/{table_id}/coupon")
def remove_order_coupon(table_id: int):
    try:
        with conn.cursor() as cur:
            cur.execute("delete from order_coupons where table_number=%s", (table_id,))
    except:
        raise HTTPException(400, "Invalid Table ID")

    return {}
