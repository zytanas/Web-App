import React, { useState, useEffect } from "react";

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

    // Attach the objectCount for this level
    result["objectCount"] = objectCount;
    return result;
};

// Helper function to sort only string values in descending order
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

const TreeView = ({ data }: { data: any }) => {
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

    const toggleExpand = (key: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const renderTree = (obj: any, parentKey = "") => {
        if (typeof obj === "object" && obj !== null) {
            return (
                <ul className="pl-4">
                    {Object.entries(obj).map(([key, value], index) => {
                        const itemKey = `${parentKey}-${index}`;
                        const isExpanded = expandedItems[itemKey];

                        if (key === "objectCount") {
                            return (
                                <li key={index} className="mb-1 font-semibold dark:text-darkText">
                                    <>Object Count: {value}</>
                                </li>
                            );
                        }

                        return (
                            <li key={index} className="mb-1 font-semibold dark:text-darkText">
                                <pre onClick={() => toggleExpand(itemKey)} style={{ cursor: 'pointer' }}>
                                    {key} {isExpanded ? "▼" : "▶"}
                                </pre>
                                {isExpanded && (
                                    typeof value === "string" ? (
                                        <pre className="inline-block max-w-auto h-auto px-2 py-1 rounded-full text-sm dark:bg-darkBadge dark:text-darkText ml-2 overflow-auto whitespace-normal">
                                            {value}
                                        </pre>
                                    ) : (
                                        renderTree(value, itemKey)
                                    )
                                )}
                            </li>
                        );
                    })}
                </ul>
            );
        }
        return null;
    };

    return <div className="overflow-y-auto">{renderTree(data)}</div>;
};


const WebApp: React.FC = () => {
    const [url, setUrl] = useState<string>("");
    const [responseData, setResponseData] = useState<any>(null);
    const [processedData, setProcessedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load persisted URL from localStorage on initial render
    useEffect(() => {
        const savedUrl = localStorage.getItem("url");
        if (savedUrl) {
            setUrl(savedUrl);
        }
    }, []);

    // Save the URL in localStorage when the user updates it
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setUrl(newUrl);
        localStorage.setItem("url", newUrl);
        setError(null);
    };

    // Fetch the URL when 'Query' is clicked
    const fetchData = async () => {
        if (!url) return;
        setIsLoading(true);  // Start loading
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setResponseData(data);
            processResponse(data);
            setError(null); // Clear error if successful
        } catch (error) {
            setError("Failed to fetch data. Check the URL.");
            setResponseData(null);
            setProcessedData(null);
        } finally {
            setIsLoading(false);  // End loading
        }
    };

    // Process and combine the object count with the sorted strings
    const processResponse = (data: any) => {
        // Sort strings first
        const sortedData = sortStringsDescending(data);

        // Then add object count metadata
        const processedWithMeta = countObjectsWithMeta(sortedData);

        setProcessedData(processedWithMeta);
    };

    return (
        <div className="mt-2 p-4 max-w-screen-2xl mx-auto dark:bg-darkSecondary shadow-lg rounded-lg">
            <div className="flex items-center gap-3 mb-4">
                {/* URL Input Field */}
                <input
                    type="text"
                    value={url}
                    onChange={handleUrlChange} // Save to localStorage on change
                    className="border p-3 w-full rounded-lg shadow-sm dark:bg-darkSecondary dark:text-darkText"
                    placeholder="Enter URL here"
                />

                {/* Query Button */}
                <button
                    onClick={fetchData}
                    className="bg-darkBtn text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-900 transition"
                >
                    Query
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-2 dark:text-darkDanger bg-darkDangerContainer rounded-md">
                    {error}
                </div>
            )}

            {isLoading && <div className="loading-spinner">Loading...</div>}  {/* Placeholder for a spinner */}

            {/* Response Display */}
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
        </div>
    );
};

export default WebApp;
