import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";
import { AiOutlineLoading3Quarters, AiOutlinePlusCircle } from "react-icons/ai";

const { Option } = Select;

const Obat = () => {
  const [namaObatList, setNamaObatList] = useState([""]);
  const [jumlahObatList, setJumlahObatList] = useState([""]);
  const [bentukObatList, setBentukObatList] = useState([""]);
  const [dosisObatList, setDosisObatList] = useState([""]);
  const [caraPakaiList, setCaraPakaiList] = useState([""]);

  const [pasienList, setPasienList] = useState([]);
  const [selectedPasienId, setSelectedPasienId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [additionalFields, setAdditionalFields] = useState(1);
  const [showAdditionalFields, setShowAdditionalFields] = useState([false]);
  const [inputValidation, setInputValidation] = useState({
    namaObat: [],
    jumlahObat: [],
    bentukObat: [],
    dosisObat: [],
    caraPakai: [],
  });
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const getPasien = async () => {
    try {
      const response = await api.get("/pasien");
      const today = new Date().toISOString().split("T")[0];
      const filteredPasien = response.data.filter(
        (pasien) => pasien.tanggal_berobat.split("T")[0] === today
      );
      setPasienList(filteredPasien);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPasien();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Memeriksa apakah ada input yang kosong
    const isAnyFieldEmpty = namaObatList.some((namaObat, index) => {
      return (
        !namaObat ||
        !jumlahObatList[index] ||
        !bentukObatList[index] ||
        !dosisObatList[index] ||
        !caraPakaiList[index]
      );
    });

    if (isAnyFieldEmpty) {
      setError("Harap isi semua bidang yang diperlukan.");
      return;
    }

    setShowConfirmationPopup(true);
  };

  const handleConfirm = async () => {
    setShowConfirmationPopup(false);
    setLoading(true);

    try {
      await Promise.all(
        namaObatList.map(async (namaObat, index) => {
          await api.post("/obat", {
            nama_obat: namaObat,
            jumlah_obat: jumlahObatList[index],
            bentuk_obat: bentukObatList[index],
            dosis_obat: dosisObatList[index],
            cara_pakai: caraPakaiList[index],
            pasien_id: selectedPasienId,
          });
        })
      );
      navigate("/pasien/obat/resep");
      setSuccess(true);
      setLoading(false);
      setError(null);
    } catch (error) {
      setLoading(false);
      setError(error.response.data.message);
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false);
  };

  const onChange = (value) => {
    setSelectedPasienId(value);
  };

  const onSearch = (value) => {
    console.log("search:", value);
  };

  const addField = () => {
    setAdditionalFields((prev) => prev + 1);
    setShowAdditionalFields((prev) => [...prev, false]);
    setNamaObatList((prev) => [...prev, ""]);
    setJumlahObatList((prev) => [...prev, ""]);
    setBentukObatList((prev) => [...prev, ""]);
    setDosisObatList((prev) => [...prev, ""]);
    setCaraPakaiList((prev) => [...prev, ""]);
  };

  const filterOption = (input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const windowHeight = window.innerHeight;
  const dropdownMaxHeight = Math.min(
    windowHeight - 200,
    pasienList.length * 40
  );

  const removeField = (index) => {
    setAdditionalFields((prev) => prev - 1);
    setShowAdditionalFields((prev) => prev.filter((value, i) => i !== index));
    setNamaObatList((prev) => prev.filter((value, i) => i !== index));
    setJumlahObatList((prev) => prev.filter((value, i) => i !== index));
    setBentukObatList((prev) => prev.filter((value, i) => i !== index));
    setDosisObatList((prev) => prev.filter((value, i) => i !== index));
    setCaraPakaiList((prev) => prev.filter((value, i) => i !== index));
  };

  return (
    <div className="flex mt-5 justify-center font-sans">
      <div className="w-full p-5 rounded-lg font-inter bg-white border border-yellow-300">
        <div className="">
          <h1 className="text-lg font-semibold mb-6 mt-2 text-center">
            Form Obat
          </h1>
          <div className="w-2/3 px-8 border-yellow-400">
            <Select
              showSearch
              placeholder="Cari Pasien"
              optionFilterProp="children"
              onChange={onChange}
              onSearch={onSearch}
              filterOption={filterOption}
              value={selectedPasienId}
              style={{ width: 150 }}
              dropdownStyle={{
                maxHeight: `${dropdownMaxHeight}px`,
                overflowY: "auto",
              }}
            >
              {pasienList
                .sort(
                  (a, b) =>
                    new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat)
                )
                .map((pasien) => (
                  <Option
                    key={pasien.id}
                    value={pasien.id}
                    children={`${pasien.nama_pasien} | ${pasien.tanggal_berobat}`}
                  ></Option>
                ))}
            </Select>
          </div>
          <form onSubmit={handleSubmit} className="px-9 py-1">
            <div className="grid gap-4 gap-y-4 py-4 sm:grid-cols-1">
              {[...Array(additionalFields)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-1 md:grid-cols-2"
                >
                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`nama-obat-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Nama Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`nama-obat-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: Bodrex"
                      value={namaObatList[index]}
                      onChange={(e) => {
                        const newList = [...namaObatList];
                        newList[index] = e.target.value;
                        setNamaObatList(newList);
                      }}
                    />
                    {inputValidation.namaObat[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {inputValidation.namaObat[index]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`jumlah-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Jumlah Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`jumlah-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: 10"
                      value={jumlahObatList[index]}
                      onChange={(e) => {
                        const newList = [...jumlahObatList];
                        newList[index] = e.target.value;
                        setJumlahObatList(newList);
                      }}
                    />
                    {inputValidation.jumlahObat[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {inputValidation.jumlahObat[index]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`bentuk-obat-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Bentuk Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`bentuk-obat-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: Tablet, Sirup, Kapsul"
                      value={bentukObatList[index]}
                      onChange={(e) => {
                        const newList = [...bentukObatList];
                        newList[index] = e.target.value;
                        setBentukObatList(newList);
                      }}
                    />
                    {inputValidation.bentukObat[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {inputValidation.bentukObat[index]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-1">
                    <label
                      htmlFor={`dosis-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Dosis Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`dosis-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: 3 kali sehari"
                      value={dosisObatList[index]}
                      onChange={(e) => {
                        const newList = [...dosisObatList];
                        newList[index] = e.target.value;
                        setDosisObatList(newList);
                      }}
                    />
                    {inputValidation.dosisObat[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {inputValidation.dosisObat[index]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-1 mb-2">
                    <label
                      htmlFor={`penggunaan-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Cara Pakai {index + 1}
                    </label>
                    <textarea
                      id={`penggunaan-${index}`}
                      className="mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 transition-colors focus:border-blue-500 border-yellow-300"
                      placeholder="Contoh: Diminum setelah makan"
                      rows="3"
                      value={caraPakaiList[index]}
                      onChange={(e) => {
                        const newList = [...caraPakaiList];
                        newList[index] = e.target.value;
                        setCaraPakaiList(newList);
                      }}
                    ></textarea>
                    {inputValidation.caraPakai[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {inputValidation.caraPakai[index]}
                      </p>
                    )}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="ml-3 flex items-center text-red-500"
                    >
                      Hapus Obat
                    </button>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-center text-red-500 text-sm ml-1 mb-2">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={addField}
              className="ml-3 flex items-center text-blue-500"
            >
              <AiOutlinePlusCircle className="mr-1" />
              Tambah Obat
            </button>
            <div className="flex justify-center bg-blue-300 py-1 px-0 rounded-lg mb-2 mt-2">
              <button type="submit" className="hover:underline">
                <span className="inline-block">
                  Selanjutnya{" "}
                  <span className="text-lg inline-block transform transition-transform duration-300 ease-in-out hover:translate-x-3 ">
                    ➔
                  </span>
                </span>
              </button>
            </div>
          </form>
          {showConfirmationPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full border border-yellow-500">
                <p className="mb-4 text-lg font-bold text-center text-gray-800">
                  Data Obat Sudah Benar?
                </p>
                <div className="text-sm mb-6 space-y-2 text-gray-700">
                  {namaObatList.map((namaObat, index) => (
                    <div key={index} className="mb-4">
                      <p>
                        <strong>Obat {index + 1}</strong>
                      </p>
                      <p>Nama Obat: {namaObat}</p>
                      <p>Jumlah Obat: {jumlahObatList[index]}</p>
                      <p>Bentuk Obat: {bentukObatList[index]}</p>
                      <p>Dosis Obat: {dosisObatList[index]}</p>
                      <p>Cara Pakai: {caraPakaiList[index]}</p>
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

export default Obat;
