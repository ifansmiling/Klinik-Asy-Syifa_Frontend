import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from "../services/api";

const { Option } = Select;

const DataPasien = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const namaDokter = userData ? userData.nama : "";

  const [formData, setFormData] = useState({
    nama_pasien: "",
    alamat_pasien: "",
    dokter: namaDokter,
    tanggal_berobat: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [formFieldsValid, setFormFieldsValid] = useState({
    nama_pasien: false,
    alamat_pasien: false,
    dokter: !!namaDokter,
    tanggal_berobat: false,
  });
  const [pasienList, setPasienList] = useState([]);
  const [filteredPasienList, setFilteredPasienList] = useState([]);
  const [selectedPasienId, setSelectedPasienId] = useState(null);
  const [patientType, setPatientType] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  useEffect(() => {
    if (patientType === "existing") {
      fetchPasienList();
    }
  }, [patientType]);

  useEffect(() => {
    if (patientType === "existing") {
      setFilteredPasienList(pasienList);
    }
  }, [pasienList, patientType]);

  const fetchPasienList = async () => {
    try {
      const response = await api.get("/pasien");
      setPasienList(response.data);
    } catch (error) {
      console.error("Failed to fetch pasien list:", error);
    }
  };

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
    if (name === "nama_pasien") {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (patientType === "existing" && selectedPasienId) {
      setShowConfirmationPopup(true);
    } else if (patientType === "new") {
      if (isFormValid()) {
        setErrorMessage("");
        setShowConfirmationPopup(true);
      }
    }
  };

  const saveDataToServer = async (data) => {
    try {
      const response = await api.post("/pasien", data);
      return response.data;
    } catch (error) {
      console.error("Failed to save data:", error);
      throw new Error("Gagal menyimpan data. Silakan coba lagi.");
    }
  };

  const handleConfirm = async () => {
    setShowConfirmationPopup(false);
    setLoading(true);
    try {
      await saveDataToServer(formData);
      setSuccess(true);
      setLoading(false);
      setErrorMessage("");
      setFormData({
        nama_pasien: "",
        alamat_pasien: "",
        dokter: namaDokter,
        tanggal_berobat: "",
      });
      navigate("/pasien/resep");
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      setErrorMessage(
        error.message || "Gagal menyimpan data. Silakan coba lagi."
      );
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false);
  };

  const isFormValid = () => {
    return Object.values(formFieldsValid).every((value) => value);
  };

  const handlePatientTypeChange = (value) => {
    setPatientType(value);
    setFormData({
      nama_pasien: "",
      alamat_pasien: "",
      dokter: namaDokter,
      tanggal_berobat: "",
    });
    setFormFieldsValid({
      nama_pasien: false,
      alamat_pasien: false,
      dokter: !!namaDokter,
      tanggal_berobat: false,
    });
    setSelectedPasienId(null);
  };

  const handlePasienSelect = (value) => {
    setSelectedPasienId(value);
    const selectedPasien = pasienList.find((pasien) => pasien.id === value);
    if (selectedPasien) {
      setFormData({
        nama_pasien: selectedPasien.nama_pasien,
        alamat_pasien: selectedPasien.alamat_pasien,
        dokter: namaDokter,
        tanggal_berobat: selectedPasien.tanggal_berobat,
      });
      setFormFieldsValid({
        nama_pasien: true,
        alamat_pasien: true,
        dokter: true,
        tanggal_berobat: true,
      });
    }
  };

  const handleSearch = (value) => {
    setFilteredPasienList(
      pasienList.filter((pasien) =>
        pasien.nama_pasien.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div className="p-8 rounded-lg font-inter mt-7 bg-white border border-yellow-300">
      <div className="text-center mb-5">
        <h2 className="text-lg font-semibold mb-5 text-center font-arial">
          Pilih Jenis Pasien
        </h2>
        <div className="flex justify-center mb-8">
          <Select
            placeholder="Pilih Jenis Pasien"
            onChange={handlePatientTypeChange}
            style={{ width: 200 }}
          >
            <Option value="new">Pasien Baru</Option>
            <Option value="existing">Pasien Lama</Option>
          </Select>
        </div>
      </div>

      {patientType === "existing" && (
        <div className="w-2/3 border-yellow-400 mx-auto mb-8">
          <h2 className="text-lg font-semibold mb-5 text-center font-arial">
            Pilih Pasien Lama
          </h2>
          <Select
            showSearch
            placeholder="Cari Pasien"
            optionFilterProp="children"
            onSearch={handleSearch}
            filterOption={false}
            onChange={handlePasienSelect}
            value={selectedPasienId}
            style={{ width: "100%" }}
            dropdownStyle={{
              maxHeight: 100,
              overflowY: "auto",
            }}
          >
            {filteredPasienList
              .sort(
                (a, b) =>
                  new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat)
              )
              .map((pasien) => (
                <Option key={pasien.id} value={pasien.id}>
                  {`${pasien.nama_pasien} | ${pasien.alamat_pasien} `}
                </Option>
              ))}
          </Select>

          {selectedPasienId && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-5 text-center font-arial">
                Detail Pasien
              </h2>
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
                      value={formData.nama_pasien}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
                      readOnly
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
                      value={formData.alamat_pasien}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dokter"
                      className="text-sm font-medium font-roboto"
                    >
                      Nama Dokter
                    </label>
                    <input
                      type="text"
                      id="dokter"
                      name="dokter"
                      value={formData.dokter}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
                      readOnly
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
            </div>
          )}
        </div>
      )}
      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full border border-yellow-500">
            <p className="mb-4 text-lg font-bold text-center text-gray-800">
              Data Pasien Sudah Benar?
            </p>
            <div className="text-sm mb-6 space-y-2 text-gray-700">
              <p>
                <span className="">Nama Pasien:</span> {formData.nama_pasien}
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

      {patientType === "new" && (
        <div>
          <h2 className="text-lg font-semibold mb-5 text-center font-arial">
            Form Data Pasien Baru
          </h2>
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
                  required
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
                  placeholder="Alamat"
                  value={formData.alamat_pasien}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dokter"
                  className="text-sm font-medium font-roboto"
                >
                  Nama Dokter
                </label>
                <input
                  type="text"
                  id="dokter"
                  name="dokter"
                  value={formData.dokter}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-blue-500 text-base transition-colors focus:border-blue-500 border-yellow-300`}
                  required
                  readOnly
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
        </div>
      )}

      {showConfirmationPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full border border-yellow-500">
            <p className="mb-4 text-lg font-bold text-center text-gray-800">
              Data Pasien Sudah Benar?
            </p>
            <div className="text-sm mb-6 space-y-2 text-gray-700">
              <p>
                <span className="">Nama Pasien:</span> {formData.nama_pasien}
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
