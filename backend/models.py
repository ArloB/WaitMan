from datetime import time
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, validator
from uuid import UUID


class Table(BaseModel):
    table_id: int


class User(BaseModel):
    email: str
    password: str
    role: int = Field(None, ge=0, lt=3)


class Order(BaseModel):
    id: int
    amount: int
    addons: Dict[int, List[str]]


class ItemID(BaseModel):
    id: int


class CartItem(BaseModel):
    item: int
    amount: int
    addons: Dict[int, List[str]]


class CartItemID(BaseModel):
    id: int


class Item(BaseModel):
    id: int
    name: str
    description: str
    category_id: int
    price: float
    availability: bool
    ord: int


# Items in order of arranged by manager
class OrderedItems(BaseModel):
    ordered_items: List[Item]


class Category(BaseModel):
    id: int
    name: str


class OrderedCategories(BaseModel):
    ordered_categories: List[Category]


class Categories(BaseModel):
    name: str


class Ingredients(BaseModel):
    name: str


class IngredientPair(BaseModel):
    item: int
    ingredient: int


class Token(BaseModel):
    token: str


class UserUpdate(User):
    new_password: Optional[str] = None


class Option(BaseModel):
    name: str
    price: float


class UpdateOption(Option):
    addon: int


class Addon(BaseModel):
    item: Optional[int] = None
    title: str
    multiselect: bool
    options: list[Option]


class Reservation(BaseModel):
    name: str
    phone: str
    no_guests: int
    date: int


class NewReservation(BaseModel):
    id: UUID
    no_guests: int
    date: int


class ReservationID(BaseModel):
    id: UUID


class OpeningHours(BaseModel):
    start: time
    end: time


class Coupon(BaseModel):
    code: str
    description: str
    type: int
    active: bool
    discount: float
    one_time: bool
    minimum: Optional[float]
    item: Optional[int]

    @validator("item")
    def exclusive_type(cls, v, values):
        if values["minimum"] is not None and v:
            raise ValueError("Conflicting type info")

        return v


class CouponID(BaseModel):
    id: int


class CouponCode(BaseModel):
    code: str
