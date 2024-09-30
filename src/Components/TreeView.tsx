import React, { useState } from "react";

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
                                    <>Object Count: {value as React.ReactNode}</>
                                </li>
                            );
                        }

                        return (
                            <li key={index} className="mb-1 font-semibold dark:text-darkText">
                                <pre className="cursor-pointer" onClick={() => toggleExpand(itemKey)}>
                                    {key} {isExpanded ? "▼" : "▶"}
                                </pre>
                                {isExpanded && (
                                    typeof value === "string" ? (
                                        <pre className="inline-block max-w-auto h-auto px-2 py-1 rounded-full text-sm bg-amber-400/25 text-white-200 ml-2 overflow-auto whitespace-normal">
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

export default TreeView;
