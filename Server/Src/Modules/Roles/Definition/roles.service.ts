import { Warning } from "../../../../Utilities/Logger.js";
import type {
  createRoleDTO,
  Role,
  RoleRepository,
  RoleService,
  updateRoleDTO,
} from "./roles.types.js";

export class Roleservice implements RoleService {
  constructor(private roleRepo: RoleRepository) {}

  async createRole(details: createRoleDTO): Promise<Role> {
    try {
      if (details.name.length <= 0 || details.description.length <= 0)
        throw new Error("Name and description length invalid");

      const createRole = await this.roleRepo.createRole(details);
      return createRole;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async editRole(roleId: string, newDetails: updateRoleDTO): Promise<Role> {
    try {
      if (!roleId) throw new Error("Role id not provided");

      let validDetails: Record<string, any> = {},
        allowedFields: string[] = ["name", "description"];

      for (let [key, value] of Object.entries(newDetails)) {
        if (key.toLowerCase().length > 0 && allowedFields.includes(key)) {
          if (value.length > 0) validDetails[key] = value;
          else throw new Error(`${key} has an empty value`);
        } else continue;
      }

      if (Object.keys(validDetails).length == 0)
        throw new Error("No valid details to update");

      const updateQuery = await this.roleRepo.editRole(roleId, newDetails);
      return updateQuery;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const retrieveRoles = await this.roleRepo.getRoles();
      return retrieveRoles;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      if (!roleId) throw new Error("Role id not provided");

      await this.roleRepo.deleteRole(roleId);
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }
}
