import os

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import uvicorn

from conf import HOST, PORT

import routes.users as users
import routes.ws as ws
import routes.tables as tables
import routes.restaurant as restaurant
import routes.reservations as reservations
import routes.order as order
import routes.items as items
import routes.ingredients as ingredients
import routes.coupons as coupons
import routes.categories as categories
import routes.cart as cart
import routes.addons as addons

app = FastAPI(title="Waitman")
app.include_router(addons.router, tags=["Addons"])
app.include_router(cart.router, tags=["Cart"])
app.include_router(categories.router, tags=["Categories"])
app.include_router(coupons.router, tags=["Coupons"])
app.include_router(ingredients.router, tags=["Ingredients"])
app.include_router(items.router, tags=["Items"])
app.include_router(order.router, tags=["Order"])
app.include_router(reservations.router, tags=["Reservations"])
app.include_router(restaurant.router, tags=["Restaurant"])
app.include_router(tables.router, tags=["Tables"])
app.include_router(users.router, tags=["Users"])
app.include_router(ws.router, tags=["WS"])

# adding cors urls and middleware
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("img"):
    os.mkdir("img")

app.mount("/img", StaticFiles(directory="img"), name="img")

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host=HOST,
        port=PORT,
        log_level="info",
        reload=True,
        ssl_keyfile="../key.pem",
        ssl_certfile="../cert.pem",
    )
