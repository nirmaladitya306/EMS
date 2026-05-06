import { EmployeeDetailsDialogBox } from "./dialogboxes.jsx";
import { DeleteEmployeeDialogBox } from "./dialogboxes.jsx";
import { ModifyEmployeeDialogBox } from "./dialogboxes.jsx";
import { RemoveEmployeeFromDepartmentDialogBox } from "./dialogboxes.jsx";

// ─────────────────────────────────────────────────────────────
// Wrapper
// ─────────────────────────────────────────────────────────────
export const ListWrapper = ({ children }) => (
  <div
    className="pg-table-wrap"
    style={{
      flex: "none",
      borderRadius: "14px 14px 0 0",
      borderBottom: "none",
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Heading
// ─────────────────────────────────────────────────────────────
export const HeadingBar = ({ table_layout, table_headings }) => (
  <div
    className={`pg-table-head grid min-[250px]:grid-cols-2 sm:${
      table_layout || "grid-cols-5"
    }`}
  >
    {table_headings.map((item) => (
      <span
        key={item}
        className={`pg-th ${
          ["Email", "Department", "Contact Number"].includes(item)
            ? "min-[250px]:hidden sm:block"
            : ""
        }`}
      >
        {item}
      </span>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────
export const ListContainer = ({ children }) => (
  <div
    style={{
      border: "1px solid rgba(0,0,0,0.07)",
      borderTop: "none",
      borderRadius: "0 0 14px 14px",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Generic Employee List (SAFE)
// ─────────────────────────────────────────────────────────────
export const ListItems = ({ TargetedState }) => {
  const data = Array.isArray(TargetedState?.data)
    ? TargetedState.data
    : [];

  return (
    <>
      {data.map((item) => (
        <div
          key={item._id}
          className="pg-table-row grid min-[250px]:grid-cols-2 sm:grid-cols-5"
        >
          <div className="pg-td-name truncate">
            {item.firstname} {item.lastname}
          </div>

          <div className="pg-td-muted min-[250px]:hidden sm:block truncate">
            {item.email}
          </div>

          <div className="pg-td-muted min-[250px]:hidden sm:block truncate text-center">
            {item.department?.name || "Not Specified"}
          </div>

          <div className="pg-td-muted min-[250px]:hidden sm:block text-center">
            {item.contactnumber}
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EmployeeDetailsDialogBox EmployeeID={item._id} />
            <ModifyEmployeeDialogBox EmployeeID={item._id} />
            <DeleteEmployeeDialogBox EmployeeID={item._id} />
          </div>
        </div>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Department Employee List (FIXED)
// ─────────────────────────────────────────────────────────────
export const DepartmentListItems = ({ TargetedState }) => {
  const employees = Array.isArray(TargetedState?.employees)
    ? TargetedState.employees
    : [];

  return (
    <>
      {employees.map((item) => (
        <div
          key={item._id}
          className="pg-table-row grid min-[250px]:grid-cols-2 sm:grid-cols-4"
        >
          <div className="pg-td-name truncate">
            {item.firstname} {item.lastname}
          </div>

          <div className="pg-td-muted min-[250px]:hidden sm:block truncate">
            {item.email}
          </div>

          <div className="pg-td-muted min-[250px]:hidden sm:block text-center">
            {item.contactnumber}
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RemoveEmployeeFromDepartmentDialogBox
              DepartmentName={TargetedState?.name}
              DepartmentID={TargetedState?._id}
              EmployeeID={item._id}
            />
          </div>
        </div>
      ))}
    </>
  );
};