import json
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Adapted from https://fastapi.tiangolo.com/advanced/websockets/ to connect multiple clients
class ConnectionManager:
    def __init__(self):
        self.customers: List[WebSocket] = []
        self.waitStaff: List[WebSocket] = []
        self.kitchenStaff: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.customers.append(websocket)

    def setWaitStaff(self, websocket: WebSocket):
        self.waitStaff.append(websocket)
        self.customers.remove(websocket)

    def getWaitStaff(self):
        return self.waitStaff

    def setKitchenStaff(self, websocket: WebSocket):
        self.kitchenStaff.append(websocket)
        self.customers.remove(websocket)

    def getKitchenStaff(self):
        return self.kitchenStaff

    def disconnect(self, websocket: WebSocket):
        if websocket in self.customers:
            self.customers.remove(websocket)
        if websocket in self.waitStaff:
            self.waitStaff.remove(websocket)
        if websocket in self.kitchenStaff:
            self.kitchenStaff.remove(websocket)


manager = ConnectionManager()

assistTables = []
kitchenOrders = []
waiterOrders = []

# Create web socket to connect all customers and restaurant staff for real-time communication
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Wait for client connections
    await manager.connect(websocket)

    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            data = json.loads(data)

            # Set wait staff
            if data["message"] == "waitstaff":
                manager.setWaitStaff(websocket)
                # Send current table requests to new wait staffs
                sendData = {"message": "tables", "tables": assistTables}
                await websocket.send_text(json.dumps(sendData))
                await websocket.send_json({"message": "orders", "orders": waiterOrders})

            # Set kitchen staff
            if data["message"] == "kitchen":
                manager.setKitchenStaff(websocket)
                await websocket.send_json(
                    {"message": "orders", "orders": kitchenOrders}
                )

            # If data is assistance, send customer request data to all wait staff
            if data["message"] == "assistance":
                sendData = {"message": "assistance", "table_id": data["table_id"]}
                # Add table number to stored table requests upon customer requests
                if int(data["table_id"]) not in assistTables:
                    assistTables.append(int(data["table_id"]))
                for staff in manager.getWaitStaff():
                    await staff.send_text(json.dumps(sendData))

            # If data is delete, send delete request to all wait staff
            if data["message"] == "delete":
                sendData = {"message": "delete", "table_id": data["table_id"]}
                # Delete table number from stored table requests upon delete requests
                if int(data["table_id"]) in assistTables:
                    assistTables.remove(int(data["table_id"]))
                for staff in manager.getWaitStaff():
                    await staff.send_text(json.dumps(sendData))

            # If data is order, send order to kitchen staff
            if data["message"] == "order":
                sendData = {
                    "message": "order",
                    "tableno": data["tableno"],
                    "cart": data["cart"],
                }
                cart = data["cart"]
                tableno = data["tableno"]

                for item in cart:
                    for i in range(item["quantity"]):
                        kitchenOrders.append(
                            {
                                "tableno": tableno,
                                "name": item["name"],
                                "addons": item["addons"],
                            }
                        )

                for kit in manager.getKitchenStaff():
                    await kit.send_json(sendData)

            # If data is ready, send ready item to wait staff
            if data["message"] == "ready":
                sendData = {
                    "message": "ready",
                    "tableno": data["tableno"],
                    "name": data["name"],
                    "addons": data["addons"],
                }
                for wait in manager.getWaitStaff():
                    await wait.send_json(sendData)
                for kit in manager.getKitchenStaff():
                    if kit != websocket:
                        await kit.send_json(
                            {"message": "ready", "index": data["index"]}
                        )
                kitchenOrders.pop(data["index"])
                waiterOrders.append(
                    {
                        "tableno": data["tableno"],
                        "name": data["name"],
                        "addons": data["addons"],
                    }
                )
            if data["message"] == "delivered":
                sendData = {"message": "delivered", "index": data["index"]}
                for wait in manager.getWaitStaff():
                    if wait != websocket:
                        await wait.send_json(sendData)

                waiterOrders.pop(data["index"])

    except WebSocketDisconnect:
        manager.disconnect(websocket)
