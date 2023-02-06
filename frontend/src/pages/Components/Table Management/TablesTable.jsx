/*
Tables component
Displays the entire table with each added table displayed in a separate row
Removes a table from the page and database when called given a table id
*/

import { useEffect } from "react";
import api from "../../../axios";

import TableRow from "./TableRow";

const TablesTable = ({ tables, setTables }) => {
  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      api.delete(`/tables`, { data: { table_id: id } }).then(() => {
        setTables([...tables.filter((table) => table !== id)]);
      });
    }
  };

  useEffect(() => {
    api.get(`/tables`).then((results) => setTables(results.tables));
  }, [setTables]);

  return (
    <div className="flex">
      <table>
        <thead>
          <tr>
            <th className="table-row"></th>
            <th className="table-row"></th>
            <th className="table-row"></th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table} className="flex justify-between px-7">
              <TableRow id={table} handleDelete={handleDelete} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablesTable;
