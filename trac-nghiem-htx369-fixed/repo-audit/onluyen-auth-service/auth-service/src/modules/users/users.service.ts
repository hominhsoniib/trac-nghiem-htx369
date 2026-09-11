import { ApiError } from "../../utils/apiError";
import { usersRepository, toPublicUser } from "./users.repository";

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return toPublicUser(user);
  },

  async updateProfile(userId: string, params: { name: string }) {
    const updated = await usersRepository.updateName(userId, params.name);
    return toPublicUser(updated);
  },
};
