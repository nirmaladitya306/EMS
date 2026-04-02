import { faker } from "@faker-js/faker";

// Random picker
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Dates
export const futureDate = () => faker.date.soon({ days: 30 });
export const pastDate = () => faker.date.past({ years: 1 });

// ✅ FIX: Properly exported function
export const employeeEmail = (first, last) => {
  return faker.internet.email({
    firstName: first,
    lastName: last,
    provider: "novacoretech.com",
  });
};

// Status enums
export const statuses = {
  leave: ["Pending", "Approved", "Rejected"],
  attendance: ["Present", "Absent", "Not Specified"],
  salary: ["Pending", "Paid", "Delayed"],
};