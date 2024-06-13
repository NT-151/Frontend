import { useRouter } from "next/router";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const router = useRouter();
  const { error } = router.query;

  // This function handles the form submission event
  const submitContactForm = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Extract the value of the "name" input from the form
    const data = event.target.elements.name.value;

    console.log(data);

    if (data) {
      router.push({
        pathname: `${router.pathname}/[id]`, // Use backticks for template literals
        query: { id: data },
      });
    }
  };

  return (
    <div className="flex items-center gap-3 flex-col">
      <form className="flex flex-row gap-3" onSubmit={submitContactForm}>
        <input
          placeholder="Enter Stock Ticker e.g. Apple = AAPL"
          className="py-2 px-5 w-[30rem] text-lg font-light rounded-full shadow"
          type="text"
          id="name"
          name="name"
          required
        />
        <button
          className="py-2 text-blue-400 px-4 bg-white rounded-full shadow"
          type="submit"
        >
          <FaSearch />
        </button>
      </form>
      <div>
        {error && <div className="text-red-500 p-4">Error: {error}.</div>}
      </div>
    </div>
  );
}
