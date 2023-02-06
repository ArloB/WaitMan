from db import conn
from fastapi import APIRouter, HTTPException

from models import Table

router = APIRouter()

# Returns the restaurant name and a list of all table numbers to display on the home page
@router.get("/", tags=["Home"])
def home_page():
    res = {"name": "", "tables": []}

    with conn.cursor() as cur:
        cur.execute("select number from tables order by number")

        for table in cur:
            res["tables"].append(table[0])

        cur.execute("select name from restaurant_info")

        res["name"] = cur.fetchone()[0]

    return res


# Returns a list of all table numbers added by the manager
@router.get("/tables")
def get_tables():
    tables = {"tables": []}

    with conn.cursor() as cur:
        cur.execute("select number from tables order by number")

        for table in cur:
            tables["tables"].append(table[0])

    return tables


# Adds a table number to the list of tables in the system
@router.post("/tables")
def add_tables(table: Table):
    with conn.cursor() as cur:
        cur.execute("select * from tables where number=%s", (table.table_id,))

        if not cur.rowcount:
            cur.execute("insert into tables(number) values(%s)", (table.table_id,))

            return {}

        raise HTTPException(400, "Table already exists")


# Deletes a table number from the list of tables in the system
@router.delete("/tables")
def delete_table(table: Table):
    try:
        with conn.cursor() as cur:
            cur.execute("delete from tables where number=%s", (table.table_id,))
    except:
        raise HTTPException(500, "Could not delete table")

    return {}
