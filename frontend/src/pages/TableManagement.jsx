/*
Table Management Page
Displays all the tables already added by the manager
Manager can add and delete tables from this page
*/

import React, { useState } from "react";

import "./tm.css";

import TablesTable from "./Components/Table Management/TablesTable";
import AddTables from "./Components/Table Management/AddTables";

const TableManagement = () => {
  const [tables, setTables] = useState([]);

  return (
    <div className="h-full">
      <div className="flex justify-end min-w-full pr-5 pt-5">
        <AddTables tables={tables} setTables={setTables} />
      </div>
      <div className="all prose flex justify-center min-w-full h-full mt-[-1.25rem]">
        <TablesTable tables={tables} setTables={setTables} />
      </div>
    </div>
  );
};

export default TableManagement;
