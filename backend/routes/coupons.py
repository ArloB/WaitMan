import random
from db import conn
from fastapi import APIRouter, HTTPException

from models import Coupon

router = APIRouter()


def couponObj(data):
    coupon = {
        "id": data[0],
        "description": data[1],
        "type": data[2],
        "active": data[3],
        "code": data[9],
        "one_time": data[10],
    }

    if data[2] == 2:
        coupon["item"] = data[6]
        coupon["item_name"] = data[7]
        coupon["item_price"] = data[8]
        coupon["new_price"] = data[4]
        coupon["discount"] = data[8] - data[4]
    else:
        coupon["discount"] = data[4]
        coupon["minimum"] = data[5]

    return coupon


@router.get("/coupons/public")
def get_public_coupons():
    coupons = []

    with conn.cursor() as cur:
        cur.execute(
            """ select id, code, description
                        from coupons
                        where not one_time
                        order by id
                    """
        )
        for coupon in cur:
            coupons.append(
                {"id": coupon[0], "code": coupon[1], "description": coupon[2]}
            )

    return {"coupons": coupons}


@router.get("/coupons")
def get_coupons():
    coupons = []

    with conn.cursor() as cur:
        cur.execute(
            """ select c.id, c.description, c.type, c.active, 
                        c.discount, c.minimum, c.item, i.name, i.price, c.code, c.one_time
                        from coupons c
                        left join items i on i.id = c.item
                        order by c.id
                    """
        )

        for data in cur:
            coupons.append(couponObj(data))

    return {"coupons": coupons}


@router.get("/coupons/{coupon_id}")
def get_coupon(coupon_id: int):
    with conn.cursor() as cur:
        cur.execute(
            """ select c.id, c.description, c.type, c.active, 
                        c.discount, c.minimum, c.item, i.name, i.price, c.code, c.one_time
                        from coupons c
                        left join items i on i.id = c.item
                        where c.id=%s
                    """,
            (coupon_id,),
        )

        if not cur.rowcount:
            raise HTTPException(400, "Invalid coupon ID")

        data = cur.fetchone()

    return couponObj(data)


@router.post("/coupons")
def add_coupon(data: Coupon):
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"insert into coupons(code, description, type, active, one_time, discount, {'item' if data.type == 2 else 'minimum'}) values(%s, %s, %s, %s, %s, %s, %s)",
                (
                    data.code,
                    data.description,
                    data.type,
                    data.active,
                    data.one_time,
                    data.discount,
                    data.item if data.type == 2 else data.minimum,
                ),
            )
    except:
        raise HTTPException(400, "Could not insert coupon")

    return {}


@router.put("/coupons/{coupon_id}")
def edit_coupon(coupon_id: int, data: Coupon):
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"update coupons set code=%s, description=%s, type=%s, active=%s, one_time=%s, discount=%s, {'item' if data.type == 2 else 'minimum'}=%s where id=%s returning *",
                (
                    data.code,
                    data.description,
                    data.type,
                    data.active,
                    data.one_time,
                    data.discount,
                    data.item if data.type == 2 else data.minimum,
                    coupon_id,
                ),
            )
    except Exception as e:
        raise HTTPException(400, f"Could not update coupon {e}")

    return {}


@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: int):
    try:
        with conn.cursor() as cur:
            cur.execute("delete from coupons where id=%s", (coupon_id,))
    except:
        raise HTTPException(400, "Could not delete coupon")

    return {}


@router.get("/coupons/{coupon_id}/generate")
def generate_coupon_code(coupon_id: int):
    with conn.cursor() as cur:
        code = None

        cur.execute(
            "select c.type, c.discount, i.name from coupons c left join items i on i.id = c.item where c.id=%s",
            (coupon_id,),
        )

        data = cur.fetchone()

        if data is None:
            raise HTTPException(400, "Invalid coupon ID")

        if data[0] == 2:
            code_str = f"${data[1]}{data[2]}"
        elif data[0] == 1:
            code_str = f"${data[1]}off"
        else:
            code_str = f"{data[1]}%off"

        v = 0

        while code is None:
            tmp_str = code_str + str(random.randint(100000, 999999))

            cur.execute(
                "select exists (select * from coupons where code=%s)", (tmp_str,)
            )

            if not cur.fetchone()[0]:
                code = tmp_str

    return {"code": code}
