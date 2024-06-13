import NavBar from "@/components/Navbar";
import SearchBar from "@/components/Searchbar";

const Simulation = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]">
      <NavBar />
      <div className="w-full fullscreen flex items-center flex-col gap-4 justify-center">
        <h1 className="font-display text-5xl font-bold tracking-normal text-gray-800 text-center">
          Stock <span className="text-blue-400">Simulation</span>{" "}
        </h1>
        <p className="w-2/3 text-center text-lg font-light text-gray-500">
          Explore the potential price of a stock 30 days into the future, gain
          an overview of its market outlook, and stay informed with the latest
          relevant news articles.
        </p>
        <SearchBar />
      </div>
    </div>
  );
};

export default Simulation;
