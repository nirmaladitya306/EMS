import { KeyDetailsBox } from "./keydetailboxes";
import { Link } from "react-router-dom";

export const ContentWraperMain = ({ children }) => (
    <div className="flex flex-col h-full">{children}</div>
);

export const KeyDetailBoxContentWrapper = ({ imagedataarray, data }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {imagedataarray.map((item) => (
            <Link to={item.path} key={item.dataname}>
                <KeyDetailsBox
                    image={item.image}
                    dataname={item.dataname}
                    data={
                        data && data[item.dataname.toLowerCase()] !== undefined
                            ? data[item.dataname.toLowerCase()]
                            : 0
                    }
                />
            </Link>
        ))}
    </div>
);