import NavBar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import SearchBar from "@/components/Searchbar";
import * as Plot from "@observablehq/plot";
import { lineY, lineX, Line } from "@observablehq/plot";
import { PiSpinnerBold } from "react-icons/pi";

const ItemPage = () => {
  const [stockData, setStockData] = useState([]);
  const containerRef = useRef();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [redirectToSearch, setRedirectToSearch] = useState(false);
  const receivedData = router.query.id;
  const [lifetimePrice, setLifetimePrice] = useState([]);
  const [date, setDate] = useState(null);
  const [companyProfile, setCompanyProfile] = useState([]);
  const [returns, setReturns] = useState(null);
  const [fetchResults, setFetchResults] = useState([]);
  const [buySignals, setBuySignals] = useState([]);
  const [sellSignals, setSellSignals] = useState([]);
  const [recentPrice, setRecentPrice] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const finnhubApiKey = process.env.NEXT_PUBLIC_KEY_FINHUB_API_KEY;

  const [displayBuySignals, setDisplaySignals] = useState(false);
  const [displaySellSignals, setDisplaySellSignals] = useState(false);

  const finnhub = require("finnhub");

  const api_key = finnhub.ApiClient.instance.authentications["api_key"];
  api_key.apiKey = finnhubApiKey;
  const finnhubClient = new finnhub.DefaultApi();

  const sendName = async () => {
    // Convert the data to JSON format
    const JSONdata = JSON.stringify(receivedData);

    // Define the API endpoint where the form data will be sent
    const endpoint =
      "https://stock-price-server-5jf6.onrender.com/api/visualise";

    // Set up options for the fetch request
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: JSONdata }),
    };

    // Send the form data to the API endpoint using fetch
    const response = await fetch(endpoint, options);
    // Check the HTTP status code of the response
    if (response.status === 400) {
      // Navigate back to the stocks page with the error message as a query parameter
      router.push({
        pathname: "/stocks",
        query: { error: "This stock does not exist. A ticker must be entered" },
      });
    }

    if (response.status === 401) {
      // Navigate back to the stocks page with the error message as a query parameter
      router.push({
        pathname: "/stocks",
        query: {
          error:
            "Not enough information about this stock. Please enter an older stock",
        },
      });
    }

    if (response.status === 402) {
      // Navigate back to the stocks page with the error message as a query parameter
      router.push({
        pathname: "/stocks",
        query: {
          error: "Please try again",
        },
      });
    }
    const result = await response.json();
    console.log(result);

    setFetchResults(result);
    setStockData(result.six_month_data);
    setIsLoading(false);
    setLifetimePrice(result.data_for_lifetime);
    setBuySignals(result.buy_signals);
    setSellSignals(result.sell_signals);
    // setRecentPrice(lastClose);
    finnhubClient.quote(receivedData, (error, data, response) => {
      setRecentPrice(data);
    });

    finnhubClient.companyProfile2(
      { symbol: receivedData },
      (error, data, response) => {
        setCompanyProfile(data);
      }
    );
  };

  useEffect(() => {
    if (receivedData) {
      sendName(); // Call sendName when receivedData is available
    }
  }, []);

  const receiveName = () => {
    router.push({
      pathname: `/simulation/${receivedData}`, // Use backticks for template literals
      query: { id: receivedData },
    });
  };

  const [formError, setFormError] = useState("");

  const potentialReturns = (event) => {
    event.preventDefault();
    setFormError("");
    let hasError = false;

    if (new Date(date) < new Date(companyProfile.ipo)) {
      setFormError(
        "Please provide a date after the company's initial public offering"
      );
      hasError = true;
    }

    if (new Date(date) > new Date()) {
      setFormError("Please provide a current date");
      hasError = true;
    }

    if (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) {
      setFormError("Please provide a weekday date");
      hasError = true;
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];

    const matchedPrices = lifetimePrice.filter((value) => {
      return value.date === formattedDate;
    });

    // Extract close values from matchedPrices
    const matchedCloses = matchedPrices.map((value) => value.close);

    if (!hasError && Object.keys(matchedPrices).length === 0) {
      setFormError("Data Unavailable");
    }

    const howMuch = investmentAmount / matchedCloses;

    const lastItem = lifetimePrice[lifetimePrice.length - 1];

    setReturns(lastItem.close * howMuch);
  };

  const [selected, setSeleted] = useState("6M");

  const showBuySignals = buySignals?.map((signals) => <li>{signals.date}</li>);
  const showSellSignals = sellSignals?.map((signals) => (
    <li>{signals.date}</li>
  ));
  const showSellClose = sellSignals?.map((signals) => <li>{signals.close}</li>);
  const showBuyClose = buySignals?.map((signals) => <li>{signals.close}</li>);

  const setFiveYearData = (event) => {
    event.preventDefault();
    setStockData(fetchResults?.five_year_data);
    setSeleted("5Y");
  };

  const setOneYearData = (event) => {
    event.preventDefault();
    setStockData(fetchResults?.one_year_data);
    setSeleted("1Y");
  };

  const setSixMonthData = (event) => {
    event.preventDefault();
    setStockData(fetchResults?.six_month_data);
    setSeleted("6M");
  };

  const setMax = (event) => {
    event.preventDefault();
    setStockData(fetchResults?.max_data);
    setSeleted("ALL");
  };

  useEffect(() => {
    if (stockData === undefined) return;

    // Parse date strings into Date objects
    const parsedData = stockData.map((item) => ({
      ...item,
      date: new Date(item.date),
    }));
    const plot = Plot.plot({
      y: { grid: true },
      marks: [
        // Plot the line graph
        Plot.lineY(parsedData, { x: "date", y: "close", tip: true }),
      ],
    });

    // Append the plot to the container element referenced by containerRef
    if (containerRef.current) {
      containerRef.current.appendChild(plot);
    }

    return () => {
      plot.remove();
    };
  }, [stockData]);
  // Run this effect whenever stockData, buySignals, or sellSignals change

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Invalid date, return empty string or handle accordingly
      return "Invalid Date";
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div>
      <NavBar />
      {isLoading && (
        <div className="w-full flex items-center justify-center fullscreen">
          <div className="flex gap-3 w-full items-center justify-center flex-col">
            <PiSpinnerBold className=" text-blue-800 animate-spin text-7xl" />
            <p className="text-2xl font-light text-gray-500">
              Please wait while your data is loading
            </p>
          </div>
        </div>
      )}
      {redirectToSearch && <SearchBar />}
      {error && <div className="text-red-400 text-sm p-4">Error: {error}.</div>}
      {!isLoading && !redirectToSearch && (
        <div className="flex bg-gradient-to-tr mt-[0.1rem] flex-col from-white to-blue-50 w-full py-10">
          <div className="w-full flex flex-row gap-20 px-14 justify-between">
            <div className="flex w-1/2 flex-col">
              <div className="flex mb-7 w-full flex-row gap-5 items-end">
                <p className="text-4xl text-gray-800">{companyProfile.name}</p>
                <p className="text-lg font-light text-gray-600">
                  {companyProfile.ticker}
                </p>
              </div>
              <div className="flex mb-10 justify-between items-center flex-row">
                <p className="text-2xl">${recentPrice?.c}</p>
                <div className="w-1/2 bg-white shadow-sm flex rounded-full border flex-row justify-between items-center">
                  <button
                    onClick={setSixMonthData}
                    className={`py-3 w-1/4 text-sm flex text-gray-400 font-medium rounded-full items-center justify-center ${
                      selected === "6M" && "bg-gray-200 text-gray-800"
                    } `}
                  >
                    6M
                  </button>
                  <button
                    onClick={setOneYearData}
                    className={`py-3 w-1/4 text-sm flex text-gray-400 font-medium rounded-full items-center justify-center ${
                      selected === "1Y" && "bg-gray-200 text-gray-800"
                    } `}
                  >
                    1Y
                  </button>
                  <button
                    onClick={setFiveYearData}
                    className={`py-3 w-1/4 text-sm flex text-gray-400 font-medium rounded-full items-center justify-center ${
                      selected === "5Y" && "bg-gray-200 text-gray-800"
                    } `}
                  >
                    5Y
                  </button>
                  <button
                    onClick={setMax}
                    className={`py-3 w-1/4 text-sm flex text-gray-400 font-medium rounded-full items-center justify-center ${
                      selected === "ALL" && "bg-gray-200 text-gray-800"
                    } `}
                  >
                    ALL
                  </button>
                </div>
              </div>
              <div className="w-full" ref={containerRef}></div>
            </div>
            <div className="flex w-1/3 flex-col">
              <div className="flex justify-end">
                <button
                  className="border py-2 px-4 sm:px-6 w-max rounded-md text-[13px] sm:text-sm shadow-sm bg-blue-400 text-white font-uncut transition-all hover:opacity-80"
                  onClick={receiveName}
                >
                  Simulate
                </button>
              </div>
              <h1 className="text-2xl font-semibold py-4">Key Data</h1>
              <div className="flex-col pb-10">
                <div className="w-full flex items-center justify-between">
                  <p>Country</p>
                  <div className="border-b mx-3 border-gray-200 w-full"></div>
                  <p>{companyProfile.country}</p>
                </div>
                <div className="w-full flex items-center justify-between">
                  <p>Currency</p>
                  <div className="border-b mx-3 border-gray-200 w-full" />
                  <p>{companyProfile.currency}</p>
                </div>
                <div className="w-full flex items-center justify-between">
                  <p>Exchange</p>
                  <div className="border-b mx-3 w-[22%] border-gray-200" />
                  <p className="w-max">{companyProfile.exchange}</p>
                </div>

                <div className="w-full flex items-center justify-between">
                  <p>Industry</p>
                  <div className="border-b mx-3 border-gray-200 w-full" />
                  <p className="w-max">{companyProfile.finnhubIndustry}</p>
                </div>

                <div className="w-full flex items-center justify-between">
                  <p>Initial Public Offering</p>
                  <div className="border-b mx-3 border-gray-200 w-[42%]" />
                  <p className="w-max">
                    {companyProfile.ipo &&
                      formatDate(companyProfile.ipo?.toString())}
                  </p>
                </div>
                <div className="w-full flex items-center justify-between">
                  <p>Market Cap</p>
                  <div className="border-b mx-3 border-gray-200 w-[40%]" />
                  <p className="w-max">
                    {companyProfile.marketCapitalization?.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-2xl mt-7 font-semibold">Potential Returns</p>
              <p className="text-sm pb-2 text-gray-600">
                Calculate your potential earnings if you had invest on a certain
                day
              </p>
              <form className="flex flex-col gap-4" onSubmit={potentialReturns}>
                <div className="w-full flex gap-1 flex-col">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="px-3 py-2 text-sm text-gray-400  border border-gray-100 rounded shadow-sm"
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
                <div className="w-full flex gap-1 flex-col">
                  <input
                    type="number"
                    id="number"
                    name="amount"
                    required
                    placeholder="Enter Amount Invested"
                    className="px-3 py-2 text-sm text-gray-800 border border-gray-100 rounded shadow-sm"
                    onChange={(event) => {
                      setInvestmentAmount(event.target.value);
                    }}
                  />
                </div>
                <button
                  className="text-sm border w-max px-6 hover:opacity-70 border-gray-100 rounded shadow-sm bg-white text-blue-400 py-2"
                  type="submit"
                >
                  Submit
                </button>{" "}
              </form>
              {returns !== null && (
                <div className="py-4 mt-5 items-center justify-center flex border-t border-b border-gray-300">
                  <p className="text-lg font-light text-gray-500">
                    {returns != "Infinity" &&
                      returns != "-Infinity" &&
                      `Your investment is now worth roughly: ${`$${returns.toFixed(
                        2
                      )}`}`}
                  </p>
                </div>
              )}
              {returns == Infinity && (
                <div>
                  <p className="text-red-500">{formError}</p>
                </div>
              )}
            </div>
          </div>
          {showBuySignals.length > 0 && showSellSignals && (
            <div className="mt-10">
              <div className="w-full py-10 justify-center text-center items-center flex flex-col">
                <h1 className="text-2xl font-semibold">
                  Potential Entry and Exit points
                </h1>
                <p className="text-sm text-gray-600">
                  Potential entry and exit points over the last 6 months,
                  generated using the Williams %R Indicator, which identifies
                  overbought or oversold conditions. A sell signal is issued
                  when the stock is near its recent high (overbought), and a buy
                  signal is issued when the stock is near its recent low
                  (oversold). Use as a guideline rather than an investment
                  strategy
                </p>
              </div>
              <div className="w-full flex px-14">
                <div className="w-1/2">
                  <h1 className="text">Buy signals</h1>
                  <button
                    onClick={() => setDisplaySignals(!displayBuySignals)}
                    className="text-blue-400 text-sm hover:opacity-70"
                  >
                    {!displayBuySignals ? "Show Buy Signals" : "Hide"}
                  </button>
                  {displayBuySignals && (
                    <div className="flex w-1/2 flex-row border border-gray-200">
                      <div className="w-1/2 bg-white">
                        <p className="px-2">Date</p>

                        {showBuySignals.map((item, index) => (
                          <div
                            className={
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }
                          >
                            <p className="px-2">
                              {formatDate(item.props.children)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="w-1/2 flex flex-col justify-end">
                        <p className="px-2 bg-white">Close</p>
                        {showBuyClose.map((item, index) => (
                          <div
                            className={
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }
                          >
                            <p className="px-2">
                              ${item.props.children.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-1/2">
                  <h1 className="text">Sell signals</h1>
                  <button
                    onClick={() => setDisplaySellSignals(!displaySellSignals)}
                    className="text-blue-400 text-sm hover:opacity-70"
                  >
                    {!displaySellSignals ? "Show Sell Signals" : "Hide"}
                  </button>
                  {displaySellSignals && (
                    <div className="flex w-1/2 flex-row border border-gray-200">
                      <div className="w-1/2 bg-white">
                        <p className="px-2">Date</p>
                        {showSellSignals.map((item, index) => (
                          <div
                            className={
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }
                          >
                            <p className="px-2">
                              {formatDate(item.props.children)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="w-1/2 flex flex-col justify-end">
                        <p className="px-2 bg-white">Close</p>
                        {showSellClose.map((item, index) => (
                          <div
                            className={
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }
                          >
                            <p className="px-2">
                              ${item.props.children.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemPage;
