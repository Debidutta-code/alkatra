import { useState, useEffect } from "react";
import axios from "axios";

type UseSearchApiProps = {
  apiUrl: string;
};

type SearchApiResponse = {
  data: any;
  error: string | null;
  loading: boolean;
};

const useSearchApi = ({ apiUrl }: UseSearchApiProps) => {
  const [search, setSearch] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(2);
  const [result, setResult] = useState<SearchApiResponse>({
    data: null,
    error: null,
    loading: false,
  });

  const handleSearch = async () => {
    try {
      setResult((prevResult) => ({ ...prevResult, loading: true }));

      const response = await axios.post(apiUrl, {
        location: search,
        capacity,
      });

      setResult({ data: response.data, error: null, loading: false });
    } catch (error) {
      setResult({ data: null, error: "Error fetching data", loading: false });
    }
  };

  useEffect(() => {
    handleSearch();
  }, [search, capacity]);

  return {
    search,
    setSearch,
    capacity,
    setCapacity,
    ...result,
    handleSearch,
  };
};

export default useSearchApi;
