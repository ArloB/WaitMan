import React from "react";
import { useParams } from "react-router-dom";

import QRCode from "react-qr-code";
import BackButton from "./Components/BackButton";

const TableCode = () => {
  const params = useParams();

  return (
    <div className="flex flex-col min-w-full min-h-screen justify-center items-center prose">
      <BackButton to="/admin" />
      <div className="bg-white p-4">
        <QRCode
          value={`https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_FIP}/${params.table_id}/menu`}
          size={512}
        />
      </div>
      <h1 className="mt-12 text-6xl">Table {params.table_id}</h1>
    </div>
  );
};

export default TableCode;
