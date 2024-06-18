import React, { useState, useEffect } from "react";
import { Button, Space, Table, Pagination, Input } from "antd";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Link } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import api from "../services/api";

const { Search } = Input;

const PasienList = () => {
  const [patients, setPatients] = useState([]);
  const [setInitialPatients] = useState([]); // State untuk menyimpan daftar pasien awal
  const [loading, setLoading] = useState(false);
  const [setEditClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State untuk menyimpan halaman saat ini
  const [pageSize] = useState(4); // State untuk menyimpan jumlah entri per halaman
  const [setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState(""); // State untuk menyimpan kolom yang sedang dicari

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get("/pasien");
        const sortedPatients = response.data.sort(
          (a, b) => new Date(b.tanggal_berobat) - new Date(a.tanggal_berobat)
        );
        setPatients(sortedPatients);
        setInitialPatients(sortedPatients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
  };

  const handleEdit = (record) => {
    console.log("Edit patient:", record);
    setEditClicked(true);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  useEffect(() => {
    const inputElement = document.getElementById("search-input");
    if (inputElement) {
      inputElement.select();
    }
  }, []);

  const columns = [
    {
      title: "Nama Pasien",
      dataIndex: "nama_pasien",
      key: "nama_pasien",
      className: "border border-yellow-200",
      ellipsis: true,
      // Filter untuk pencarian
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Search
            id="search-input"
            placeholder={`Search Nama Pasien`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(selectedKeys, confirm, "nama_pasien")
            }
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, "nama_pasien")}
            size="small"
            style={{ width: 90, marginRight: 8 }}
            className="w-24 bg-yellow-400 border-yellow-500"
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
            className="w-24 bg-yellow-400 border-yellow-500"
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <BiSearch style={{ color: filtered ? "#1890ff" : undefined }} />
      ),

      onFilter: (value, record) =>
        record["nama_pasien"].toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(
            () => document.getElementById("search-input").select(),
            100
          );
        }
      },
      render: (text) =>
        searchedColumn === "nama_pasien" ? (
          <span style={{ color: "black" }}>{text}</span>
        ) : (
          <span style={{ color: "black" }}>{text}</span>
        ),
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Alamat Pasien",
      dataIndex: "alamat_pasien",
      key: "alamat_pasien",
      className: "border border-yellow-200",
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Dokter",
      dataIndex: "dokter",
      key: "dokter",
      className: "border border-yellow-200",
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Tanggal Berobat",
      dataIndex: "tanggal_berobat",
      key: "tanggal_berobat",
      className: "border border-yellow-200",
      ellipsis: true,
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Aksi",
      key: "action",
      className: "border border-yellow-200 ml-9",
      render: (record) => (
        <Space size="middle" className="text-center">
          <Link
            to={`/pasien/edit/${record.id}`}
            className="text-blue-500 hover:text-blue-700 hover:underline text-zl"
            onClick={() => handleEdit(record)}
            style={{ display: "inline-block", width: "100%" }}
          >
            Edit
          </Link>
        </Space>
      ),
    },
  ];

  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="container mx-auto mt-9 text-center px-4">
        <h1 className="mb-5 font-semibold text-lg md:text-xl lg:text-2xl xl:text-2xl">
          Semua Pasien
        </h1>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={paginatedPatients}
              onChange={handleChange}
              pagination={false}
              scroll={{ x: true }}
            />
            <div className="flex flex-wrap justify-center md:justify-end mt-4 px-4">
              <Pagination
                current={currentPage}
                total={patients.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasienList;
