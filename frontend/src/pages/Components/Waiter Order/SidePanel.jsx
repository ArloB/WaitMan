/*
Side panel for the wait staff page
Displays the table number of customers who request assistance from the customer menu pages
Table numbers can be deleted from this page after attending to tables
*/

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

const SidePanel = ({ ws }) => {
  const [tables, setTables] = useState([]);
  const stateRef = useRef();

  stateRef.current = tables;

  useEffect(() => {
    if (ws) {
      ws.addEventListener("message", (event) => {
        var data = JSON.parse(event.data);
        if (data["message"] === "assistance") {
          const table_id = data["table_id"];
          if (!stateRef.current.includes(table_id)) {
            setTables((current) => [...current, table_id]);
            toast(
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="ml-4">{`Table ${table_id} requests assistance`}</span>
              </div>
            );
          }
        } else if (data["message"] === "delete") {
          setTables((current) => current.filter((t) => t !== data["table_id"]));
        } else if (data["message"] === "tables") {
          if (data["tables"].length > 0) {
            for (let i = 0; i < data["tables"].length; i++) {
              setTables((current) => [...current, data["tables"][i]]);
            }
          }
        }
      });
    }
  }, [ws]);

  const removeTable = (table) => {
    ws.send(JSON.stringify({ message: "delete", table_id: table }));
    setTables((current) => current.filter((t) => t !== table));
  };

  return (
    <div>
      <ul>
        <div className="flex flex-row space-x-10">
          <h1 className="title">Assistance</h1>
        </div>
        <div>
          {tables.map((table, i) => (
            <li key={i}>
              <div className="flex flex-row">
                <div className="w-1/4">
                  <h4 className="text-base">Table {table}</h4>
                </div>
                <div>
                  <button
                    className="btn btn-square btn-error btn-xs"
                    onClick={() => removeTable(table)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default SidePanel;
