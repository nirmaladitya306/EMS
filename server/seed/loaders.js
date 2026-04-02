import { Organization } from "../models/Organization.model.js";
import { HumanResources } from "../models/HR.model.js";
import { Employee } from "../models/Employee.model.js";
import { Department } from "../models/Department.model.js";

export const loadBase = async () => {
  const org = await Organization.findOne({ name: "NovaCore Technologies Pvt. Ltd." });
  if (!org) throw new Error("Organization not found");

  const hr = await HumanResources.findOne({ email: "aarav.mehta@novacoretech.com" });

  const employees = await Employee.find({ organizationID: org._id });
  const departments = await Department.find({ organizationID: org._id });

  return { org, hr, employees, departments };
};