import { Employee } from "../models/Employee.model.js";
import { faker } from "@faker-js/faker";
import { employeeEmail } from "./utils.js";

export const enrichEmployees = async (employees, positions, departments, org, batch) => {
  for (let emp of employees) {
    if (!emp.position) {
      emp.position = positions[1]?._id; // default manager layer
    }

    if (!emp.manager) {
      const randomManager = employees[Math.floor(Math.random() * employees.length)];
      if (randomManager._id.toString() !== emp._id.toString()) {
        emp.manager = randomManager._id;
      }
    }

    await emp.save();
  }
};

export const createExtraEmployees = async (org, departments, batch, count = 5) => {
  const created = [];

  for (let i = 0; i < count; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();

    const emp = await Employee.create({
      firstname: first,
      lastname: last,
      email: employeeEmail(first, last),
      password: "Test@123",
      contactnumber: faker.phone.number(),
      role: "Employee",
      department: departments[0]?._id,
      organizationID: org._id,
      seedBatch: batch
    });

    created.push(emp);
  }

  return created;
};