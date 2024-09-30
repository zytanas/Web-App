import React, { useState, useEffect } from "react";
import TreeView from "./TreeView";
import LoadingSpinner from "./LoadingSpinner";

const countObjectsWithMeta = (data: any, depth: number = 0): any => {
    if (typeof data !== "object" || data === null) return data;

    let objectCount = 0;
    const result: any = Array.isArray(data) ? [] : {};

    for (const key in data) {
        if (typeof data[key] === "object" && data[key] !== null) {
            objectCount++;
            result[key] = countObjectsWithMeta(data[key], depth + 1);
        } else {
            result[key] = data[key];
        }
    }

    result["objectCount"] = objectCount;
    return result;
};

const sortStringsDescending = (data: any, cache = new Map()): any => {
    const traverse = (obj: any): any => {
        if (typeof obj === "string") {
            if (cache.has(obj)) return cache.get(obj);
            const sortedString = obj.split("").sort((a, b) => b.localeCompare(a)).join("");
            cache.set(obj, sortedString); // Cache the sorted string
            return sortedString;
        } else if (typeof obj === "object" && obj !== null) {
            const newObj: any = Array.isArray(obj) ? [] : {};
            for (const key in obj) {
                newObj[key] = traverse(obj[key]);
            }
            return newObj;
        }
        return obj;
    };
    return traverse(data);
};

const WebApp: React.FC = () => {
    const [url, setUrl] = useState<string>("");
    const [responseData, setResponseData] = useState<any>(null);
    const [processedData, setProcessedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedUrl = localStorage.getItem("url");
        if (savedUrl) {
            setUrl(savedUrl);
        }
    }, []);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        localStorage.setItem("url", newUrl);
        setError(null);
    };

    const fetchData = async () => {
        if (!url) {
            setError("URL is required. Please enter a valid URL.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setResponseData(data);
            processResponse(data);
            setError(null);
        } catch (error) {
            setError("Failed to fetch data. Check the URL.");
            setResponseData(null);
            setProcessedData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const processResponse = (data: any) => {
        const sortedData = sortStringsDescending(data);
        const processedWithMeta = countObjectsWithMeta(sortedData);

        setProcessedData(processedWithMeta);
    };

    return (
        <div className="mt-2 p-4 max-w-screen-2xl mx-auto dark:bg-darkSecondary shadow-lg rounded-lg">
            <div className="flex items-center gap-3 mb-4">
                <input
                    type="text"
                    value={url}
                    onChange={handleUrlChange}
                    className={`border p-3 w-full rounded-lg shadow-sm dark:bg-darkSecondary dark:text-darkText ${error && !url ? 'border-red-500' : ''}`}
                    placeholder="Enter URL here"
                />

                <button
                    onClick={fetchData}
                    className="bg-darkBtn text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-900 transition"
                >
                    Query
                </button>
            </div>

            {error && (
                <div className="mb-4 p-2 dark:text-darkDanger bg-darkDangerContainer rounded-md">
                    {error}
                </div>
            )}

            {isLoading ? (
                <LoadingSpinner />  
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-darkCard rounded-lg shadow">
                        <h3 className="font-semibold dark:text-darkText text-lg mb-2">
                            URL Response
                        </h3>
                        <pre className="dark:text-darkText text-sm overflow-auto">
                            {responseData
                                ? JSON.stringify(responseData, null, 2)
                                : "No response yet."}
                        </pre>
                    </div>

                    <div className="p-4 bg-darkCard rounded-lg shadow">
                        <h3 className="font-semibold dark:text-darkText text-lg mb-2">
                            Processed Response
                        </h3>
                        {processedData ? (
                            <TreeView data={processedData} />
                        ) : (
                            <pre className="text-sm dark:text-darkText overflow-auto">
                                'No processed data yet.'
                            </pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebApp;
