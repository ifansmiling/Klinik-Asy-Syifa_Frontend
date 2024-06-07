import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const DataPasien = () => {
  const [formData, setFormData] = useState({
    nama_pasien: "",
    alamat_pasien: "",
    dokter: "",
    tanggal_berobat: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isNewPatient] = useState(true);
  const [selectedOption] = useState("new");
  const [formFieldsValid, setFormFieldsValid] = useState({
    nama_pasien: false,
    alamat_pasien: false,
    dokter: false,
    tanggal_berobat: false,
  });
  const [existingPatientSelected] = useState(false);
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormFieldsValid({
      ...formFieldsValid,
      [name]: value.trim() !== "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === "existing" && existingPatientSelected) {
      navigate(`/pasien/obat/`);
    } else if (selectedOption === "new") {
      if (isFormValid()) {
        setErrorMessage("");
        setShowConfirmationPopup(true);
      } else {
        setErrorMessage("Silakan isi semua bidang sebelum melanjutkan.");
      }
    }
  };

  const handleConfirm = async () => {
    setShowConfirmationPopup(false);
    setLoading(true);
    try {
      await api.post("/pasien", formData);
      setSuccess(true);
      setLoading(false);
      setErrorMessage("");
      setFormData({
        nama_pasien: "",
        alamat_pasien: "",
        dokter: "",
        tanggal_berobat: "",
      });
      navigate("/pasien/obat");
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      setErrorMessage("Gagal menyimpan data. Silakan coba lagi.");
      console.error("Error saving data: ", error);
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false);
  };

  const isFormValid = () => {
    return Object.values(formFieldsValid).every((value) => value);
  };

  return (
    <div className="p-8 rounded-lg font-inter mt-7 bg-white border border-yellow-300">
      <div className="">
        <h2 className="text-lg font-semibold mb-5 mr-9 text-center font-arial">
          Form Data Pasien
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nama_pasien"
              className="text-sm font-medium font-roboto"
            >
              Nama Pasien
            </label>
            <input
              type="text"
              id="nama_pasien"
              name="nama_pasien"
              placeholder="Pasien"
              value={formData.nama_pasien}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
              required={isNewPatient}
              disabled={selectedOption === "existing"}
            />
          </div>
          <div>
            <label
              htmlFor="alamat_pasien"
              className="text-sm font-medium font-roboto"
            >
              Alamat Pasien
            </label>
            <input
              type="text"
              id="alamat_pasien"
              name="alamat_pasien"
              placeholder="Alamat Pasien"
              value={formData.alamat_pasien}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
              required
              disabled={selectedOption === "existing"}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dokter" className="text-sm font-medium font-roboto">
              Dokter
            </label>
            <input
              type="text"
              id="dokter"
              name="dokter"
              placeholder="Dokter"
              value={formData.dokter}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
              required
              disabled={selectedOption === "existing"}
            />
          </div>
          <div>
            <label
              htmlFor="tanggal_berobat"
              className="text-sm font-medium font-roboto"
            >
              Tanggal Berobat
            </label>
            <input
              type="date"
              id="tanggal_berobat"
              name="tanggal_berobat"
              value={formData.tanggal_berobat}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
              required
              disabled={selectedOption === "existing"}
            />
          </div>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
        <div className="flex justify-center bg-blue-300 py-1 px-0 rounded-lg">
          <button
            type="submit"
            className={`transition-colors relative ${
              loading ? "pointer-events-none" : ""
            }`}
            disabled={!existingPatientSelected && selectedOption === "existing"}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <span className="inline-block font-Roboto text-l text-black-700">
                Selanjutnya{" "}
                <span className="text-lg inline-block transform transition-transform duration-300 ease-in-out hover:translate-x-3">
                  ➔
                </span>
              </span>
            )}
          </button>
        </div>
      </form>
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full border border-yellow-500">
            <p className="mb-4 text-lg font-bold text-center text-gray-800">
              Data Pasien Sudah Benar?
            </p>
            <div className="text-sm mb-6 space-y-2 text-gray-700">
              <p>
                <span className="">Nama Pasien:</span>{" "}
                {formData.nama_pasien}
              </p>
              <p>
                <span className="">Alamat Pasien:</span>{" "}
                {formData.alamat_pasien}
              </p>
              <p>
                <span className="">Dokter:</span> {formData.dokter}
              </p>
              <p>
                <span className="">Tanggal Berobat:</span>{" "}
                {formData.tanggal_berobat}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition"
                onClick={handleCancel}
              >
                Belum
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition"
                onClick={handleConfirm}
              >
                Sudah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPasien;
