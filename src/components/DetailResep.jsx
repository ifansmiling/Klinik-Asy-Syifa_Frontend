import React, { useState, useEffect } from "react";
import api from "../services/api";
import { message, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const DetailResep = ({ pasienId, onClose, onProcessCompleted }) => {
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleSelesaiDibuat = async () => {
    try {
      await api.put(`/pasien/${pasienId}`, { proses_resep: "Selesai" });
      setStatusUpdated(true);
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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
      <Button
        onClick={handleSelesaiDibuat}
        className="bg-green-500 hover:bg-green-700 text-white font-arial py-1 px-4 rounded mr-4 print-hidden"
      >
        Selesai Dibuat
      </Button>
      <Button
        onClick={handleCetakResep}
        icon={<PrinterOutlined />}
        className="bg-blue-500 hover:bg-blue-700 text-white font-arial py-1 px-4 rounded print-hidden "
      >
        Cetak Resep
      </Button>
    </div>
  );
};

export default DetailResep;
