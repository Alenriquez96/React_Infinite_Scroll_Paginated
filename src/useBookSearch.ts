import { useEffect, useState } from "react";
import axios, { Canceler } from "axios";

interface Books {
  title: string;
}

export default function useBookSearch(query: string, pageNumber: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState<Books[]>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setBooks([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel: Canceler;
    const fetchData = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: "http://openlibrary.org/search.json",
          params: { q: query, page: pageNumber },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });

        setBooks((prevBooks) => [
          ...new Set([
            ...prevBooks,
            ...res.data.docs.map((b: Books) => b.title),
          ]),
        ]);
        setHasMore(res.data.docs.length > 0);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) return;
        setError(true);
      }
    };
    fetchData();
    return () => cancel();
  }, [query, pageNumber]);

  return { loading, error, books, hasMore };
}
