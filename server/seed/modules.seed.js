import { Attendance } from "../models/Attendance.model.js";
import { Salary } from "../models/Salary.model.js";
import { Leave } from "../models/Leave.model.js";
import { statuses, futureDate, pastDate } from "./utils.js";

export const seedAttendance = async (employees, org, batch) => {
  for (let emp of employees) {
    const logs = [];

    for (let i = 0; i < 30; i++) {
      logs.push({
        logdate: pastDate(),
        logstatus: statuses.attendance[Math.floor(Math.random() * 3)]
      });
    }

    await Attendance.create({
      employee: emp._id,
      status: "Present",
      attendancelog: logs,
      organizationID: org._id,
      seedBatch: batch
    });
  }
};

export const seedSalary = async (employees, org, batch) => {
  for (let emp of employees) {
    const basic = Math.floor(Math.random() * 50000) + 20000;

    await Salary.create({
      employee: emp._id,
      basicpay: basic,
      bonuses: 5000,
      deductions: 2000,
      netpay: basic + 5000 - 2000,
      currency: "INR",
      duedate: futureDate(),
      status: "Pending",
      organizationID: org._id,
      seedBatch: batch
    });
  }
};

export const seedLeaves = async (employees, org, batch) => {
  for (let emp of employees) {
    await Leave.create({
      employee: emp._id,
      startdate: pastDate(),
      enddate: futureDate(),
      reason: "Personal leave",
      status: statuses.leave[Math.floor(Math.random() * 3)],
      organizationID: org._id,
      seedBatch: batch
    });
  }
};