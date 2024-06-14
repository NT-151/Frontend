import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/Navbar";
import * as Plot from "@observablehq/plot";
import { PiSpinnerBold } from "react-icons/pi";
import Link from "next/link";

const ItemPage = () => {
  const router = useRouter();
  const containerRef = useRef();
  const receivedData = router.query.id;
  const [simulate, setSimulate] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [redirectToSearch, setRedirectToSearch] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);
  const [companyProfile, setCompanyProfile] = useState([]);
  const [recentPrice, setRecentPrice] = useState(null);
  const [changeInPrice, setChangeInPrice] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(null);
  const finnhubApiKey = process.env.NEXT_PUBLIC_KEY_FINHUB_API_KEY;

  const finnhub = require("finnhub");

  const api_key = finnhub.ApiClient.instance.authentications["api_key"];
  api_key.apiKey = finnhubApiKey;
  const finnhubClient = new finnhub.DefaultApi();

  useEffect(() => {
    if (receivedData) {
      console.log(receivedData);
      sendName();
      // Call sendName when receivedData is available
    }
  }, [receivedData]);

  const sendName = async () => {
    // Convert the data to JSON format
    const JSONdata = JSON.stringify(receivedData);

    // Define the API endpoint where the form data will be sent
    const endpoint =
      "https://simulationendpoint-romkoj4qoq-no.a.run.app/api/simulate";

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
        pathname: "/simulation",
        query: { error: "This stock does not exist" },
      });
    }

    if (response.status === 401) {
      // Navigate back to the stocks page with the error message as a query parameter
      router.push({
        pathname: "/simulation",
        query: {
          error:
            "Not enough information about this stock. Please enter an older stock",
        },
      });
    }

    if (response.status === 500) {
      router.push({
        pathname: "/simulation",
        query: {
          error: "Please try again",
        },
      });
    }

    const result = await response.json();

    setSimulate(result.simulated_prices);
    setIsLoading(false);
    setAnalysis(result.stock_analysis);
    setNewsArticles(result.news_articles);

    setChangeInPrice(result?.change_in_price);
    setDisplayPrice(result?.last_price);

    finnhubClient.companyProfile2(
      { symbol: receivedData },
      (error, data, response) => {
        setCompanyProfile(data);
      }
    );

    finnhubClient.quote(receivedData, (error, data, response) => {
      setRecentPrice(data);
    });
  };

  const arrayDataItems = newsArticles.map((articles) => <li>{articles}</li>);

  useEffect(() => {
    if (simulate === undefined) return;
    const parsedData = simulate.map((item) => ({
      ...item,
      date: new Date(item.date),
    }));

    const plot = Plot.lineY(parsedData, {
      x: "date",
      y: "close",
      tip: true,
    }).plot({
      y: { grid: true },
    });

    // Append the plot to the container element referenced by containerRef
    if (containerRef.current) {
      containerRef.current.append(plot);
    }

    return () => {
      plot.remove();
    };
  }, [simulate]);

  const receiveName = () => {
    router.push({
      pathname: `/stocks/${receivedData}`, // Use backticks for template literals
      query: { id: receivedData },
    });
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
      {error && (
        <div className="text-red-500 p-4">
          Error: {error}. Please try again.
        </div>
      )}
      {!isLoading && !redirectToSearch && (
        <div className="flex bg-gradient-to-tr mt-[0.1rem] from-white to-blue-50 justify-between min-h-screen w-full gap-20 px-14 py-10">
          <div className="flex w-full gap-10 flex-row">
            <div className="w-1/2 flex flex-col">
              <p className="text-lg font-light text-gray-600">
                {companyProfile?.ticker}
              </p>
              <p className="text-4xl text-gray-800"> {companyProfile?.name}</p>

              <div className="py-2">
                <p className="text-lg font-light">
                  Predicted price in 30 days ${displayPrice.toFixed(2)}
                </p>
                <p className="text-lg font-light">
                  From todays price ${changeInPrice.toFixed(2)}
                </p>
              </div>

              <div className="pt-6" ref={containerRef}></div>
              <button
                className="border py-2 mt-10 px-4 sm:px-6 w-max rounded-md text-[13px] sm:text-sm shadow-sm bg-blue-400 text-white font-uncut transition-all hover:opacity-80"
                onClick={receiveName}
              >
                Stock History
              </button>
            </div>
            <div className="w-1/2 overflow-hidden">
              <h1 className="text-2xl font-semibold pt-4">Analysis</h1>

              <p>{analysis}</p>
              <h1 className="text-2xl font-semibold pt-4">
                Latest News Articles
              </h1>
              <ul className="w-max flex flex-col gap-1">
                {arrayDataItems.map((article) => (
                  <Link target="_blank" href={article.props.children}>
                    <p className="text-sm hover:opacity-70 text-blue-600">
                      {article.props.children}
                    </p>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ItemPage;
