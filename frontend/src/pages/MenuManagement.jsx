import React from "react";
import { useNavigate } from "react-router-dom";

import ItemsTable from "./Components/Menu Management/ItemsTable";

function MenuManagement() {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="prose flex justify-end min-w-full pr-5 pt-5">
        <button
          type="button"
          className="btn btn-outline-primary text-xl w-48"
          onClick={() => navigate("/admin/menu/add")}
        >
          Add Product
        </button>
      </div>
      <div className="flex justify-center h-full mt-[-1.25rem]">
        <div className="card">
          <div className="card-body overflow-y-auto min-w-[80vw]">
            <ItemsTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuManagement;
