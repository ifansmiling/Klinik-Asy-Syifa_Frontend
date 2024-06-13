import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faProcedures,
  faPills,
  faClipboardCheck,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../services/api";

const Dashboard = () => {
  const [patientsToday, setPatientsToday] = useState(0);
  const [totalResepHariIni, setTotalResepHariIni] = useState(0);
  const [patientsSelesaiHariIni, setPatientsSelesaiHariIni] = useState([]);
  const [chartData, setChartData] = useState({
    categories: [],
    series: [
      {
        name: "Pasien",
        data: [],
      },
    ],
  });
  const [initialChartData, setInitialChartData] = useState({
    categories: [],
    series: [
      {
        name: "Pasien",
        data: [],
      },
    ],
  });
  const [isWeeklyView, setIsWeeklyView] = useState(true);

  useEffect(() => {
    const fetchPatientsToday = async () => {
      try {
        const response = await axios.get("/pasien/today/date");
        const pasienList = response.data;
        setPatientsToday(pasienList.length);
      } catch (error) {
        console.error("Error fetching patients today:", error);
      }
    };

    const fetchTotalResepHariIni = async () => {
      try {
        const response = await axios.get("/resep_obat/today/date");
        const totalResep = response.data.totalResepObatHariIni;
        setTotalResepHariIni(totalResep);
      } catch (error) {
        console.error("Error fetching total resep hari ini:", error);
      }
    };

    const fetchPatientsSelesaiHariIni = async () => {
      try {
        const response = await axios.get("/pasien/today/obat/selesai");
        const pasienList = response.data;
        setPatientsSelesaiHariIni(pasienList);
      } catch (error) {
        console.error(
          "Error fetching patients with finished prescriptions today:",
          error
        );
      }
    };
    fetchPatientsToday();
    fetchTotalResepHariIni();
    fetchPatientsSelesaiHariIni();
  }, []);

  const updateChartForClickedDate = async (minDate, maxDate) => {
    console.log(minDate);
    console.log(maxDate);
    try {
      const response = await axios.get("/pasien/perhari-by-week/hari", {
        params: {
          startOfWeek: minDate,
          endOfWeek: maxDate,
        },
      });
      const newData = response.data;

      setChartData({
        categories: Object.keys(newData),
        series: [
          {
            name: "Pasien",
            data: Object.values(newData).map((item) => item.pasien),
          },
        ],
      });

      setIsWeeklyView(false);
    } catch (error) {
      console.error("Error updating chart for clicked date:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/pasien/today/obat/week/date");
        const data = response.data;

        const weeks = Object.keys(data);
        const pasienData = [];
        const categories = [];

        const last7Weeks = weeks.slice(-7);

        last7Weeks.forEach((week) => {
          categories.push(week);
          pasienData.push(data[week].pasien);
        });

        const initialData = {
          categories: categories,
          series: [{ name: "Pasien", data: pasienData }],
        };

        setChartData(initialData);
        setInitialChartData(initialData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const resetChart = () => {
    setChartData(initialChartData);
    setIsWeeklyView(true);
  };

  return (
    <Layout>
      <div className="p-8 font-sans border border-yellow-300">
        <h1 className="text-2xl font-bold mb-2 text-justify">
          Selamat Datang!
        </h1>
        <p className="text-lg mb-8 text-justify">
          Klinik Asy-Syifa merupakan tempat pelayanan kesehatan yang menyediakan
          layanan medis yang berkualitas dengan perawatan dan fasilitas yang
          ada. Kami berkomitmen untuk memberikan pelayanan terbaik kepada setiap
          pasien dan keluarga mereka.
        </p>
        <p className="text-lg mb-5 text-justify">
          Berikut Informasi tentang pasien dan juga resep yang sedang dibuat
          hari ini:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col bg-gradient-to-r from-white to-blue-200 p-6 rounded-lg text-center shadow-md hover:shadow-lg border border-black text-black transform transition-transform ">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Jumlah Pasien Hari ini
            </h3>
            <p className="text-base md:text-xl">{patientsToday}</p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faProcedures}
                className="text-blue-700 text-3xl animate-bounce"
              />
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-r from-white to-yellow-400 p-6 rounded-lg text-center shadow-md hover:shadow-lg border border-black text-black transform transition-transform ">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Total Resep Obat Hari ini
            </h3>
            <p className="text-base md:text-xl">{totalResepHariIni}</p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faPills}
                className="text-green-700 text-3xl animate-pulse"
              />
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-r from-white to-blue-400 p-6 rounded-lg text-center shadow-md hover:shadow-lg border border-black text-black transform transition-transform">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Resep Selesai Hari ini
            </h3>
            <p className="text-base md:text-xl">
              {patientsSelesaiHariIni.length}
            </p>
            <div className="flex justify-center items-center mt-4 border-b-4 border-black pb-4">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className="text-yellow-700 text-3xl animate-pulse"
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg mb-4 duration-300 border border-blue-400">
          <div className="bg-white">
            <h3 className="text-xl font-semibold mb-8 border-b border-black">
              CHART
            </h3>
          </div>
          <p className="text-base mb-4 text-justify">
            Grafik di bawah ini menampilkan jumlah pasien yang datang setiap
            minggu dalam 7 minggu terakhir. Informasi ini membantu untuk melacak
            tren kunjungan pasien dari waktu ke waktu dan mengidentifikasi
            pola-pola tertentu yang mungkin muncul.
          </p>
          <div className="border-b border-blue-300">
            <Chart
              options={{
                markers: {
                  size: 5,
                },
                chart: {
                  height: 450,
                  type: "area",
                  background: "#fff",
                  marginTop: 30,
                  events: {
                    click(event, chartContext, config) {
                      if (isWeeklyView) {
                        const minDate =
                          chartContext.w.globals.categoryLabels[
                            config.dataPointIndex
                          ].split(" - ")[0];
                        const maxDate =
                          chartContext.w.globals.categoryLabels[
                            config.dataPointIndex
                          ].split(" - ")[1];
                        updateChartForClickedDate(minDate, maxDate);
                      }
                    },
                  },
                },
                toolbar: {
                  show: true,
                  tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                    customIcons: [],
                  },
                  autoSelected: "zoom",
                },
                dataLabels: {
                  enabled: false,
                },

                stroke: {
                  curve: "smooth",
                },
                xaxis: {
                  categories: chartData.categories,
                },

                tooltip: {
                  shared: false,
                  intersect: true,
                  x: {
                    format: "dd/MM/yy HH:mm",
                  },
                },
                colors: ["#008FFB"],
                title: {
                  text: "Patient Chart",
                  align: "center",
                  margin: 40,
                  offsetY: 20,
                  style: {
                    fontSize: "26px",
                    fontFamily: "Roboto",
                    fontWeight: "bold",
                    color: "#333",
                  },
                },
              }}
              series={chartData.series}
              type="area"
              height={350}
            />
          </div>
          <div className="mt-2 mb-4 mr-2">
            <button
              onClick={resetChart}
              className="mb-2 bg-white text-black"
              style={{ float: "right" }}
            >
              <FontAwesomeIcon
                icon={faArrowsRotate}
                style={{ color: "gray", fontSize: "0.9em" }}
              />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
  
export default Dashboard;
