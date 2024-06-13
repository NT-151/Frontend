import Link from "next/link";

export default function Home() {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]">
      <div className="px-14 mb-4 h-screen items-center justify-center flex w-full ">
        <div className="flex w-full items-center justify-center gap-3 flex-col">
          <h1 className="font-display text-4xl font-bold tracking-normal text-gray-800 sm:6xl md:text-7xl text-center">
            Financial Investment{" "}
            <span className="text-blue-400">Assistant</span>{" "}
          </h1>
          <p className="w-2/3 text-center text-lg font-light text-gray-500">
            A financial investment assistant that empowers you with
            comprehensive stock insights, facilitating informed decision-making.
            We provide visualised historical data, trend analysis, and 30-day
            price predictions
          </p>
          <div className="flex flex-row gap-4">
            <Link href="/stocks">
              <button className="border py-2 px-4 sm:px-6 w-max rounded-md text-[13px] sm:text-sm shadow-sm bg-blue-400 text-white font-uncut transition-all hover:opacity-80">
                Stock History
              </button>
            </Link>
            <Link href="/simulation">
              <button className="border py-2 px-4 sm:px-6 rounded-md w-max text-[13px] sm:text-sm shadow-sm text-blue-500 bg-white font-uncut transition-all hover:opacity-60 flex flex-row items-center gap-2">
                Simulation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
