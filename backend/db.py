import sys
import psycopg

from conf import DBNAME, DBPASS, DBUSER

# establishing connection to database
try:
    conn = psycopg.connect(
        f"{f'dbname={DBNAME}' if DBNAME else ''}{f' user={DBUSER}' if DBUSER else ''}{f' password={DBPASS}' if DBPASS else ''}",
        autocommit=True,
    )
except psycopg.Error as err:
    print("DB error: ", err)
