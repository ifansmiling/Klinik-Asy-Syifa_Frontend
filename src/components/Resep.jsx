import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import { AiOutlinePlusCircle } from "react-icons/ai";

const { Option } = Select;

const Resep = () => {
  const [obatList, setObatList] = useState([]);
  const [selectedObatIds, setSelectedObatIds] = useState(Array(2).fill(null));
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [additionalFields, setAdditionalFields] = useState(1);
  const [data, setData] = useState([
    {
      nama_resep: "",
      jumlah_resep: "",
      bentuk_resep: "",
      obat_id: null,
    },
  ]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const navigate = useNavigate();

  const getObat = async () => {
    try {
      const response = await api.get("/obat");
      const obatData = response.data;

      const today = new Date().toISOString().split("T")[0];
      const obatListWithPasienToday = await Promise.all(
        obatData.map(async (obat) => {
          const pasienResponse = await api.get(`/pasien/${obat.pasien_id}`);
          const pasienData = pasienResponse.data;
          if (pasienData.tanggal_berobat.split("T")[0] === today) {
            return { ...obat, pasien: pasienData };
          }
          return null;
        })
      );

      const filteredObatListWithPasienToday = obatListWithPasienToday.filter(
        (obat) => obat !== null
      );

      setObatList(filteredObatListWithPasienToday);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getObat();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmptyField = data.some(
      (resep) =>
        resep.nama_resep === "" ||
        resep.jumlah_resep === "" ||
        resep.bentuk_resep === ""
    );

    if (isEmptyField) {
      setError("Semua bidang harus diisi.");
      return;
    }

    setShowConfirmationPopup(true);
  };

  const handleConfirm = async () => {
    setShowConfirmationPopup(false);
    setLoading(true);
    try {
      await Promise.all(
        data.map(async (resep, index) => {
          await api.post("/resep_obat", {
            nama_resep: resep.nama_resep,
            jumlah_resep: resep.jumlah_resep,
            bentuk_resep: resep.bentuk_resep,
            obat_id: selectedObatIds[index],
          });
        })
      );
      setSuccess(true);
      setLoading(false);
      setError(null);
      navigate("/pasien");
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false);
  };

  const onChange = (value, index) => {
    setSelectedObatIds((prev) => {
      const newSelectedObatIds = [...prev];
      newSelectedObatIds[index] = value;
      return newSelectedObatIds;
    });
  };

  const addField = () => {
    setAdditionalFields((prev) => prev + 1);
    setData((prevData) => [
      ...prevData,
      {
        nama_resep: "",
        jumlah_resep: "",
        bentuk_resep: "",
        obat_id: null,
      },
    ]);
    setSelectedObatIds((prev) => [...prev, null]);
  };

  const removeField = (index) => {
    setAdditionalFields((prev) => prev - 1);
    setData((prevData) => prevData.filter((_, i) => i !== index));
    setSelectedObatIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (value, field, index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const windowHeight = window.innerHeight;
  const dropdownMaxHeight = Math.min(windowHeight - 200, obatList.length * 40);

  return (
    <div className="flex mt-5 justify-center font-sans">
      <div className="w-full p-3 rounded-lg font-inter bg-white border border-yellow-300">
        <div className="">
          <h1 className="text-lg font-semibold mb-4 text-center">
            Form Resep Obat
          </h1>
          <form onSubmit={handleSubmit} className="px-9 py-7">
            {data.map((resep, index) => (
              <div key={index} className="grid gap-y-4 grid-cols-2 mb-8">
                <div className="mt-2 ml-4">
                  <label
                    htmlFor={`obat-${index}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Cari Obat {index + 1}
                  </label>
                  <Select
                    className="mt-2"
                    showSearch
                    placeholder="Cari Obat"
                    optionFilterProp="children"
                    onChange={(value) => onChange(value, index)}
                    value={selectedObatIds[index]}
                    style={{ width: 400 }}
                    dropdownStyle={{
                      maxHeight: `${dropdownMaxHeight}px`,
                      overflowY: "auto",
                    }}
                    dropdownMatchSelectWidth={false}
                  >
                    {obatList.map((obat) => (
                      <Option key={obat.id} value={obat.id}>
                        {`${obat.nama_obat} | ${obat.jumlah_obat} | ${
                          obat.pasien ? obat.pasien.nama_pasien : ""
                        }`}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor={`nama-resep-${index}`}
                    className="text-sm ml-3 mb-2 font-medium text-gray-700"
                  >
                    Nama Resep {index + 1}
                  </label>
                  <div className="mt-1"></div>
                  <input
                    value={resep.nama_resep}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "nama_resep", index)
                    }
                    type="text"
                    id={`nama-resep-${index}`}
                    className="mt-1 ml-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                    placeholder="Contoh: Amoxilin"
                  />
                </div>
                <div className="mt-1 ml-3 flex flex-col">
                  <label
                    htmlFor={`jumlah-resep-${index}`}
                    className="text-sm font-medium mb-2 text-gray-700"
                  >
                    Jumlah Resep {index + 1}
                  </label>
                  <input
                    value={resep.jumlah_resep}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "jumlah_resep", index)
                    }
                    type="text"
                    id={`jumlah-resep-${index}`}
                    className="mt-1  px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                    placeholder="Contoh: 100mg"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor={`bentuk-resep-${index}`}
                    className="text-sm mt-1 ml-3 mb-2 font-medium text-gray-700"
                  >
                    Bentuk Resep {index + 1}
                  </label>
                  <input
                    value={resep.bentuk_resep}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "bentuk_resep", index)
                    }
                    type="text"
                    id={`bentuk-resep-${index}`}
                    className="mt-1 ml-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                    placeholder="Contoh: Tablet, Sirup, Kapsul"
                  />
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="ml-3 mt-1 flex items-center text-red-500"
                  >
                    Hapus Resep
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end mt-1">
              <section className="text-sm grid w-full place-items-center pt-4">
                {error && <p className="text-red-400 ">{error}</p>}
                {success && (
                  <p className="text-green-400">
                    Berhasil Menambahkan Data Resep Obat
                  </p>
                )}
              </section>
            </div>
            <button
              type="button"
              onClick={addField}
              className="ml-2 mt-3 flex items-center text-blue-500"
            >
              <AiOutlinePlusCircle className="mr-1" />
              Tambah Resep
            </button>
            <div className="flex justify-center bg-blue-300 py-1 px-0 rounded-lg mb-2 mt-2">
              <button type="submit" className="hover:underline cursor-pointer">
                <span className="text-black-600">Simpan</span>
              </button>
            </div>
          </form>
          {showConfirmationPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full border border-yellow-500">
                <p className="mb-4 text-lg font-bold text-center text-gray-800">
                  Data Resep Obat Sudah Benar?
                </p>
                <div className="text-sm mb-6 space-y-2 text-gray-700">
                  {data.map((resep, index) => (
                    <div key={index} className="mb-4">
                      <p>
                        <strong>Resep {index + 1}</strong>
                      </p>
                      <p>Nama Resep: {resep.nama_resep}</p>
                      <p>Jumlah Resep: {resep.jumlah_resep}</p>
                      <p>Bentuk Resep: {resep.bentuk_resep}</p>
                    </div>
                  ))}
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
      </div>
    </div>
  );
};

export default Resep;
