import React, { useState, useEffect } from "react";
import { message, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const PrintResep = ({ onProcessCompleted }) => {
  const [statusUpdated] = useState(false);

  const handleCetakResep = () => {
    window.print();
  };

  useEffect(() => {
    if (statusUpdated) {
      message.success("Resep Selesai Dibuat");
      onProcessCompleted();
    }
  }, [statusUpdated, onProcessCompleted]);

  return (
    <div className="text-center mt-8">
      {!statusUpdated ? <div></div> : null}
      <div className="flex flex-col md:flex-row justify-center items-center">
        <Button
          onClick={handleCetakResep}
          icon={<PrinterOutlined />}
          className="bg-blue-500 hover:bg-blue-700 text-white font-arial py-1 px-4 rounded print-hidden"
        >
          Cetak Resep
        </Button>
      </div>
    </div>
  );
};

export default PrintResep;
