import { KeyDetailsBox } from "./keydetailboxes";
import { Link } from "react-router-dom";

export const ContentWraperMain = ({ children }) => (
    <div className="flex flex-col h-full">{children}</div>
);

// ─── FIX: The API returns `requestes` (server typo), not `requests`.
// Map each card's display name to the actual API key.
const DATA_KEY_MAP = {
    employees:   "employees",
    departments: "departments",
    leaves:      "leaves",
    requests:    "requestes",   // server-side typo — API field is "requestes"
};

export const KeyDetailBoxContentWrapper = ({ imagedataarray, data }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {imagedataarray.map((item) => {
            const apiKey = DATA_KEY_MAP[item.dataname.toLowerCase()] ?? item.dataname.toLowerCase();
            return (
                <Link to={item.path} key={item.dataname}>
                    <KeyDetailsBox
                        image={item.image}
                        dataname={item.dataname}
                        data={
                            data && data[apiKey] !== undefined
                                ? data[apiKey]
                                : 0
                        }
                    />
                </Link>
            );
        })}
    </div>
);