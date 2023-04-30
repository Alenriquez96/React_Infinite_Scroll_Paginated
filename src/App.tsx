import { useState, useRef, useCallback, Suspense } from "react";
import useBookSearch from "./useBookSearch";

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);

  const { books, hasMore, loading, error } = useBookSearch(query, pageNumber);

  const observer = useRef<any>();
  const lastBookElementRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPageNumber(1);
  }

  return (
    <>
      <input type="text" value={query} onChange={handleSearch}></input>
      {books.map((book: any, index) => {
        if (books.length === index + 1) {
          return (
            <Suspense fallback={<BooksGlimmer />}>
              <div ref={lastBookElementRef} key={index}>
                {book}
              </div>
            </Suspense>
          );
        } else {
          return <div key={index}>{book}</div>;
        }
      })}
      <div>{loading && <p style={{ color: "green" }}>Loading...</p>}</div>
      <div>{error && "Error"}</div>
    </>
  );
}

function BooksGlimmer() {
  return (
    <div className="glimmer-panel">
      <div className="glimmer-line" />
      <div className="glimmer-line" />
      <div className="glimmer-line" />
    </div>
  );
}
