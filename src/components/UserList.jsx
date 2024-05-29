import React, { useState, useEffect } from "react";
import { Button, Space, Table, Popconfirm, message, Pagination } from "antd";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Link } from "react-router-dom";
import api from "../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, roleData] = await Promise.all([
          api.get("/user"),
          api.get("/role"),
        ]);

        const updatedUsers = userData.data.map((user) => {
          const role = roleData.data.find((role) => role.id === user.role.id);
          return {
            ...user,
            role: role ? role.role : "Unknown",
            active: user.active, // Tambahkan properti 'active'
          };
        });

        setUsers(updatedUsers);
        setRoles(roleData.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const handleEdit = (record) => {
    console.log("Edit user:", record);
    setEditClicked(true);
  };

  // Perbarui status pengguna di server dan di state setelah menonaktifkan
  const handleDisable = async (record) => {
    console.log("Disable user:", record);
    try {
      await api.put(`/user/${record.id}/disable`);
      const updatedUsers = users.map((user) =>
        user.id === record.id ? { ...user, active: "inactive" } : user
      );
      setUsers(updatedUsers); // Perbarui status pengguna di state
      message.success("Sukses dinonaktifkan pengguna");
    } catch (error) {
      console.error("Error disabling user:", error);
      message.error("Gagal menonaktifkan pengguna");
    }
  };

  // Perbarui status pengguna di server dan di state setelah mengaktifkan kembali
  const handleEnable = async (record) => {
    console.log("Enable user:", record);
    try {
      await api.put(`/user/${record.id}/enable`);
      const updatedUsers = users.map((user) =>
        user.id === record.id ? { ...user, active: "active" } : user
      );
      setUsers(updatedUsers); // Perbarui status pengguna di state
      message.success("Sukses mengaktifkan kembali pengguna");
    } catch (error) {
      console.error("Error enabling user:", error);
      message.error("Gagal mengaktifkan kembali pengguna");
    }
  };

  const handleAddUser = () => {
    console.log("Navigating to add user page");
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      sorter: (a, b) => a.nama.localeCompare(b.nama),
      sortOrder: sortedInfo.columnKey === "nama" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: roles.map((role) => ({ text: role.role, value: role.role })),
      filteredValue: filteredInfo.role || null,
      onFilter: (value, record) => record.role === value,
      ellipsis: true,
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (text, record) => (
        <span>
          {record.active === "active" ? (
            <span className="text-green-500">Active</span>
          ) : (
            <span className="text-red-500">Inactive</span>
          )}
        </span>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      filteredValue: filteredInfo.active || null,
      onFilter: (value, record) => record.active === value,
      ellipsis: true,
    },

    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Link
            to={`/user/edit/${record.id}`}
            className={`text-blue-500 ${
              editClicked ? "text-blue-500" : ""
            } hover:text-blue-500 hover:underline`}
            onClick={() => handleEdit(record)}
            onMouseDown={() => setEditClicked(true)}
            onMouseUp={() => setEditClicked(false)}
            onMouseLeave={() => setEditClicked(false)}
          >
            Edit
          </Link>
          {record.active === "active" ? (
            <Popconfirm
              title="Apakah mau nonaktifkan pengguna ini?"
              onConfirm={() => handleDisable(record)}
              okText="Ya"
              cancelText="Tidak"
            >
              <button
                className={`text-red-500 hover:text-black-500 hover:underline`}
                onClick={() => {}}
              >
                Nonaktifkan
              </button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Apakah mau aktifkan kembali pengguna ini?"
              onConfirm={() => handleEnable(record)}
              okText="Ya"
              cancelText="Tidak"
            >
              <button
                className={`text-green-500 hover:text-black-500 hover:underline`}
                onClick={() => {}}
              >
                Aktifkan
              </button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="mt-7 text-center">
        <h1 className="mb-4 font-semibold text-lg">Semua Pengguna</h1>
        <div className="flex justify-center space-x-4 items-center mb-4">
          <Button
            onClick={clearFilters}
            className="mt-1 flex items-center justify-center"
          >
            Clear filters
          </Button>
          <Button
            onClick={clearAll}
            className="mt-1 flex items-center justify-center"
          >
            Clear filters and sorters
          </Button>
        </div>
      </div>
      <div className="mt-2 mb-2 ml-2 text-left">
        <Link
          to={"/user/add"}
          onClick={handleAddUser}
          className="inline-block px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 focus:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:bg-green-800"
        >
          Add User
        </Link>
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
              dataSource={paginatedUsers}
              onChange={handleChange}
              pagination={false} // Disable pagination for now, you can remove this line if you want pagination
            />
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                total={users.length}
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

export default UserList;
