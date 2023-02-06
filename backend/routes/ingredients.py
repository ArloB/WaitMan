from db import conn
from fastapi import APIRouter

from models import IngredientPair, Ingredients

router = APIRouter()

# Returns a list of all the ingredients including the name and id
@router.get("/ingredients")
def get_ingredients():
    ingredients = []

    with conn.cursor() as cur:
        cur.execute("select name, id from ingredients")

        for ingredient in cur:
            ingredients.append({"name": ingredient[0], "id": ingredient[1]})

    return {"ingredients": ingredients}


# Adds an ingredient to the list of ingredients
@router.post("/ingredients")
def add_ingredient(ingredient: Ingredients):
    id = ""

    with conn.cursor() as cur:
        cur.execute(
            "insert into ingredients(name) values(%s) returning id", (ingredient.name,)
        )

        id = cur.fetchone()[0]

    return {"id": id}


# Deletes an ingredient from the list of ingredients for a menu item
@router.delete("/ingredients")
def delete_ingredient(pair: IngredientPair):
    with conn.cursor() as cur:
        cur.execute(
            "delete from item_ingredients where item=%s and ingredient=%s",
            (pair.item, pair.ingredient),
        )

    return {}
