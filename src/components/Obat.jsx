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

    // Validasi input sebelum mengirimkan data
    const newInputValidation = {
      namaObat: [],
      jumlahObat: [],
      bentukObat: [],
      dosisObat: [],
      caraPakai: [],
    };

    let isValid = true;

    namaObatList.forEach((namaObat, index) => {
      if (namaObat.trim() === "") {
        newInputValidation.namaObat[index] = "Nama obat harus diisi";
        isValid = false;
      }
    });

    jumlahObatList.forEach((jumlahObat, index) => {
      if (jumlahObat.trim() === "") {
        newInputValidation.jumlahObat[index] = "Jumlah obat harus diisi";
        isValid = false;
      }
    });

    bentukObatList.forEach((bentukObat, index) => {
      if (bentukObat.trim() === "") {
        newInputValidation.bentukObat[index] = "Bentuk obat harus diisi";
        isValid = false;
      }
    });

    dosisObatList.forEach((dosisObat, index) => {
      if (dosisObat.trim() === "") {
        newInputValidation.dosisObat[index] = "Dosis obat harus diisi";
        isValid = false;
      }
    });

    caraPakaiList.forEach((caraPakai, index) => {
      if (caraPakai.trim() === "") {
        newInputValidation.caraPakai[index] = "Cara pakai obat harus diisi";
        isValid = false;
      }
    });

    if (!selectedPasienId) {
      isValid = false;
      setError("Pasien harus dipilih");
    }

    if (!isValid) {
      setInputValidation(newInputValidation);
      return;
    }

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
    <div className="flex mt-10 justify-center font-sans">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-md shadow-md">
          <h1 className="text-lg font-semibold mb-6 text-center">Form Obat</h1>
          <div className="w-2/3 px-8">
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
            <div className="gap-y-1 py-4 grid grid-cols-1 gap-x-3">
              {[...Array(additionalFields)].map((_, index) => (
                <div key={index} className="grid gap-y-2 grid-cols-2">
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label
                      htmlFor={`nama-obat-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Nama Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`nama-obat-${index}`}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label
                      htmlFor={`jumlah-${index}`}
                      className="ml-3 text-sm font-medium text-gray-700"
                    >
                      Jumlah Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`jumlah-${index}`}
                      className="mt-1 ml-3 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label
                      htmlFor={`bentuk-obat-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Bentuk Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`bentuk-obat-${index}`}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label
                      htmlFor={`dosis-${index}`}
                      className="text-sm ml-3 font-medium text-gray-700"
                    >
                      Dosis Obat {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`dosis-${index}`}
                      className="mt-1 ml-3 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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
                  <div className="flex flex-col col-span-2 sm:col-span-1 mb-2">
                    <label
                      htmlFor={`penggunaan-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Cara Pakai {index + 1}
                    </label>
                    <textarea
                      id={`penggunaan-${index}`}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
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

            <button
              type="button"
              onClick={addField}
              className="ml-3 flex items-center text-blue-500"
            >
              <AiOutlinePlusCircle className="mr-1" />
              Tambah Obat
            </button>
            <div className="flex justify-center bg-gray-300 py-1 px-0 rounded-lg mb-2 mt-2">
              <button type="submit" className="hover:underline">
                <span className="inline-block">
                  Lanjut{" "}
                  <span className="text-lg inline-block transform transition-transform duration-300 ease-in-out hover:translate-x-3 ">
                    ➔
                  </span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Obat;
