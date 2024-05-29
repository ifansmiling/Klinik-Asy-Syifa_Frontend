import React, { useState, useEffect } from "react";
import api from "../services/api";
import { message, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons"; // Mengimpor ikon printer dari Ant Design

const DetailResep = ({ pasienId, onClose, onProcessCompleted }) => {
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleSelesaiDibuat = async () => {
    try {
      // Panggil API untuk memperbarui status resep menjadi "Selesai"
      await api.put(`/pasien/${pasienId}`, { proses_resep: "Selesai" });
      setStatusUpdated(true);
      window.location.reload();
      // window.location.reload(); // Refresh halaman setelah status
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Fungsi untuk mencetak resep
  const handleCetakResep = () => {
    // Memicu pencetakan
    window.print();
  };

  useEffect(() => {
    if (statusUpdated) {
      message.success("Resep Selesai Dibuat"); // Menampilkan pesan sukses
      onProcessCompleted();
    }
  }, [statusUpdated, onProcessCompleted]);

  return (
    <div className="text-center">
      {!statusUpdated ? <div></div> : null}
      <Button
        onClick={handleSelesaiDibuat}
        className="bg-green-500 hover:bg-green-700 text-white font-arial py-1 px-4 rounded mr-4 print:hidden"
      >
        Selesai Dibuat
      </Button>
      <Button
        onClick={handleCetakResep}
        icon={<PrinterOutlined />}
        className="bg-blue-500 hover:bg-blue-700 text-white font-arial py-1 px-4 rounded print:hidden" // Menambahkan kelas print:hidden
      >
        Cetak Resep
      </Button>
    </div>
  );
};

export default DetailResep;
