import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const EditPasien = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama_pasien: "",
    alamat_pasien: "",
    dokter: "",
    tanggal_berobat: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPasienData();
  }, []);

  const getPasienData = async () => {
    try {
      const response = await api.get(`/pasien/${id}`);
      const pasienData = response.data;
      setFormData(pasienData); // Menggunakan data langsung dari response
    } catch (error) {
      setError("Gagal mengambil data pasien");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/pasien/update/${id}`, formData);
      setSuccess(true);
      setLoading(false);
      setError(null);
      navigate("/pasienlist");
    } catch (error) {
      setLoading(false);
      setError("Gagal memperbarui data pasien");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8">
        <div className="p-8 rounded-lg shadow-lg font-poppins">
          <h2 className="text-xl font-bold mb-6 mt-4 text-center">Edit Pasien</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label htmlFor="nama_pasien" className="text-sm font-medium text-gray-700">Nama Pasien</label>
                <input type="text" id="nama_pasien" name="nama_pasien" value={formData.nama_pasien} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" required />
              </div>
              <div className="col-span-1">
                <label htmlFor="alamat_pasien" className="text-sm font-medium text-gray-700">Alamat Pasien</label>
                <input type="text" id="alamat_pasien" name="alamat_pasien" value={formData.alamat_pasien} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" required />
              </div>
              <div className="col-span-1">
                <label htmlFor="dokter" className="text-sm font-medium text-gray-700">Dokter</label>
                <input type="text" id="dokter" name="dokter" value={formData.dokter} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" required />
              </div>
              <div className="col-span-1">
                <label htmlFor="tanggal_berobat" className="text-sm font-medium text-gray-700">Tanggal Berobat</label>
                <input type="date" id="tanggal_berobat" name="tanggal_berobat" value={formData.tanggal_berobat} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" required />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="py-2 px-4 min-w-[150px] grid place-items-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {loading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Simpan"}
              </button>
            </div>
            <section className="text-sm grid w-full place-items-center pt-4">
              {error && <p className="text-red-400">{error}</p>}
              {success && <p className="text-green-400">Data pasien berhasil diperbarui</p>}
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPasien;
