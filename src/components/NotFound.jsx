import React from "react";

function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold">404 - Halaman Tidak Ditemukan</h2>
        <p className="text-l mt-4">Maaf, halaman yang Anda cari tidak ada.</p>
      </div>
    </div>
  );
}

export default NotFound;
