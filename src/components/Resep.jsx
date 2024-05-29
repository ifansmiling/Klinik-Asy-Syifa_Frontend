import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import { AiOutlineLoading3Quarters, AiOutlinePlusCircle } from "react-icons/ai";

const { Option } = Select;

const Resep = () => {
  const [obatList, setObatList] = useState([]);
  const [selectedObatIds, setSelectedObatIds] = useState(
    Array(2)
      .fill(null)
      .map(() => [])
  );
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

    // Check if any field is empty
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
      navigate("/pasien");
      setSuccess(true);
      window.location.reload();
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
    }
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
    <div className="flex mt-10 justify-center font-sans">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-md shadow-md">
          <h1 className="text-lg font-semibold mb-6 text-center">
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
                    className="mt-1 ml-3 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
                    placeholder="Contoh: 100mg"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor={`bentuk-resep-${index}`}
                    className="text-sm ml-3 mb-2 font-medium text-gray-700"
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
                    className="mt-1 ml-3 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
            <button
              type="button"
              onClick={addField}
              className="ml-2 mt-3 flex items-center text-blue-500"
            >
              <AiOutlinePlusCircle className="mr-1" />
              Tambah Resep
            </button>
            <div className="flex justify-center bg-gray-300 py-1 px-0 rounded-lg mb-2 mt-2">
              <button
                type="submit"
                className="hover:underline cursor-pointer"
                onClick={handleSubmit}
              >
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </div>
        <div className="flex justify-end mt-5">
          <section className="text-sm grid w-full place-items-center pt-4">
            {error && <p className="text-red-400 ">{error}</p>}
            {success && (
              <p className="text-green-400">
                Berhasil Menambahkan Data Resep Obat
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Resep;
