import jwt
from fastapi import HTTPException


def new_token(u_id, iat, role):
    """
    Token is based on time that user logged in and existing user id
    Computation Time between calls + u_id should eliminate possibility of duplicate tokens
    """
    payload = {"u_id": u_id, "iat": iat, "role": role}
    token = jwt.encode(payload, "secret", algorithm="HS512")
    return token


def decode_token(token):
    """
    Extracts u_id and login time
    """
    try:
        vals = jwt.decode(token, "secret", algorithms=["HS512"])
    except:
        raise HTTPException(400, "Token is invalid")

    return [int(vals["u_id"]), int(vals["iat"])]


def get_addons(cur, item_id, isCart=False, order_id=None):
    if isCart:
        cur.execute(
            """ select a.id, a.multiselect, a.title, ao.name, ao.price,
                            case when aoo.id is not null
                                then true
                                else false
                            end
                        from addons a
                        left join addon_options ao on a.id=ao.addon
                        left join item_orders io on io.id = %s
                        left join addon_orders aos on aos.item = io.id and aos.addon = a.id
                        left join addon_options_orders aoo on aoo.addon = aos.id and aoo.addon_option = ao.name
                        where a.item=%s
                        order by a.id
                    """,
            (order_id, item_id),
        )
    else:
        cur.execute(
            """ select a.id, a.multiselect, a.title, ao.name, ao.price
                        from addons a
                        left join addon_options ao on a.id=ao.addon
                        where a.item=%s
                        order by id
                    """,
            (item_id,),
        )

    addons = []
    last = 0
    addon = None
    price = 0

    for ad in cur:
        option = {}

        if ad[0] != last:
            if last != 0:
                addons.append(addon)

            addon = {"options": []}

            addon["id"] = ad[0]
            addon["type"] = ad[1]
            addon["title"] = ad[2]

        if ad[3] is not None:
            option["name"] = ad[3]
            option["price"] = ad[4]
            if isCart:
                option["checked"] = ad[5]

                if ad[5]:
                    price = price + ad[4]

            addon["options"].append(option)

        last = ad[0]

    if addon is not None:
        addons.append(addon)

    if isCart:
        return [addons, price]
    else:
        return addons
