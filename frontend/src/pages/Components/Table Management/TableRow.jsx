/*
Table Row Component
Displays a table row containing the table number, its qr code 
and a button to delete the table number based on its table id
Redirects to close-up of qr code when clicked
*/

import { useNavigate, Link } from "react-router-dom";

import QRCode from "react-qr-code";

const TableRow = ({ id, handleDelete }) => {
  const navigate = useNavigate();

  return (
    <>
      <td className="cell pl-5 pt-5 text-center text-2xl">Table {id}</td>
      <td className="flex">
        <div className="pr-2">
          <Link to={`/admin/table/${id}`} />
          <div>
            <button
              onClick={() => {
                navigate(`/admin/table/${id}`);
              }}
            >
              <QRCode
                value={`https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/${id}/menu`}
                size={64}
              />
            </button>
          </div>
        </div>
        <div className="pt-1.5">
          <button
            className="btn btn-ghost btn-m"
            onClick={() => handleDelete(id)}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </>
  );
};

export default TableRow;
