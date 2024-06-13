import Link from "next/link";

const NavBar = () => {
  return (
    <div className="bg-blue-40 h-[4rem] z-50 bg-white px-14 flex items-center justify-between shadow-sm">
      <Link href="/">
        <button className="flex mr-4 hover:opacity-40 transition-all">
          Home
        </button>
      </Link>
      <div className="flex flex-row gap-2">
        <Link href="/stocks">
          <button className="flex mr-4 hover:opacity-40 transition-all">
            History
          </button>
        </Link>
        <Link href="/simulation">
          <button className="flex mr-4 hover:opacity-40 transition-all">
            Simulation
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
