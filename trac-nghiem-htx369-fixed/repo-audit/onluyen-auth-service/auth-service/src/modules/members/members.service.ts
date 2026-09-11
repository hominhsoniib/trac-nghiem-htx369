import { ApiError } from "../../utils/apiError";
import { membersRepository, toPublicMember, MemberInput } from "./members.repository";

export const membersService = {
  async list() {
    const rows = await membersRepository.list();
    return rows.map(toPublicMember);
  },

  async create(input: MemberInput) {
    const created = await membersRepository.create(input);
    return toPublicMember(created);
  },

  async update(id: string, input: MemberInput) {
    const updated = await membersRepository.update(id, input);
    if (!updated) throw ApiError.notFound("Member not found");
    return toPublicMember(updated);
  },

  async remove(id: string) {
    const ok = await membersRepository.remove(id);
    if (!ok) throw ApiError.notFound("Member not found");
  },
};
