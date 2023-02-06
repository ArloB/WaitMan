from db import conn
from fastapi import APIRouter

from models import Categories, OrderedCategories

router = APIRouter()

# Returns a list of all the categories including the category id and name
@router.get("/categories")
def get_categories():
    categories = {"categories": []}

    with conn.cursor() as cur:
        cur.execute("select * from categories order by ord")

        for cat in cur:
            categories["categories"].append(
                {"id": cat[0], "name": cat[1], "ord": cat[2]}
            )

    return categories


# Adds a new category to the list of categories
@router.post("/categories")
async def add_category(category: Categories):
    id = ""

    with conn.cursor() as cur:
        cur.execute(
            "insert into categories(name) values(%s) returning id", (category.name,)
        )

        id = cur.fetchone()[0]

    return {"id": id}


# Updates the order in which categories are displayed on the customer menu
@router.put("/category_order")
async def update_category_order(ordered_categories: OrderedCategories):
    with conn.cursor() as cur:
        for i, category in enumerate(ordered_categories.ordered_categories):
            cur.execute("update categories set ord=%s where id=%s", (i, category.id))

    return {}
