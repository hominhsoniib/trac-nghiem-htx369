import { pool } from "../../db/pool";
import { usersRepository } from "../users/users.repository";
import { hashPassword } from "../../utils/password";

export type MemberRow = {
  id: string;
  member_code: string;
  member_type: "ca_nhan" | "phap_nhan";
  name: string;
  phone: string | null;
  email: string | null;
  password?: string | null;
  tax_code: string | null;
  representative: string | null;
  role_label: string;
  progress_count: number;
  exam_score: number | null;
  status: "STUDYING" | "PASSED";
  cert_id: string | null;
  joined_date: string;
  created_at: Date;
  updated_at: Date;
};

export type MemberInput = {
  memberCode: string;
  type: "ca_nhan" | "phap_nhan";
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  taxCode?: string;
  representative?: string;
  role?: string;
  status: "STUDYING" | "PASSED";
  examScore?: number | null;
  certId?: string | null;
  progressCount?: number;
};

export const membersRepository = {
  async list(): Promise<MemberRow[]> {
    const { rows } = await pool.query<MemberRow>(`SELECT * FROM members ORDER BY created_at DESC`);
    return rows;
  },

  async findById(id: string): Promise<MemberRow | null> {
    const { rows } = await pool.query<MemberRow>(`SELECT * FROM members WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },

  async create(input: MemberInput): Promise<MemberRow> {
    const { rows } = await pool.query<MemberRow>(
      `INSERT INTO members
        (member_code, member_type, name, phone, email, password, tax_code, representative, role_label, status, exam_score, cert_id, progress_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        input.memberCode, input.type, input.name, input.phone ?? null, input.email ?? null,
        input.password ?? null, input.taxCode ?? null, input.representative ?? null, input.role ?? "Thành viên HTX 369",
        input.status, input.examScore ?? null, input.certId ?? null, input.progressCount ?? 0,
      ]
    );

    if (input.email && input.password && input.password.trim() !== "") {
      try {
        const hash = await hashPassword(input.password);
        await usersRepository.updatePasswordByEmail(input.email, hash);
      } catch (e) {
        /* best-effort sync */
      }
    }

    return rows[0];
  },

  async update(id: string, input: Partial<MemberInput>): Promise<MemberRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const memberCode = input.memberCode !== undefined ? input.memberCode : existing.member_code;
    const memberType = input.type !== undefined ? input.type : existing.member_type;
    const name = input.name !== undefined ? input.name : existing.name;
    const phone = input.phone !== undefined ? input.phone : existing.phone;
    const email = input.email !== undefined ? input.email : existing.email;
    const password = input.password !== undefined && input.password.trim() !== "" ? input.password : existing.password;
    const taxCode = input.taxCode !== undefined ? input.taxCode : existing.tax_code;
    const representative = input.representative !== undefined ? input.representative : existing.representative;
    const roleLabel = input.role !== undefined ? input.role : existing.role_label;
    const status = input.status !== undefined ? input.status : existing.status;
    const examScore = input.examScore !== undefined ? input.examScore : existing.exam_score;
    const certId = input.certId !== undefined ? input.certId : existing.cert_id;
    const progressCount = input.progressCount !== undefined ? input.progressCount : existing.progress_count;

    const { rows } = await pool.query<MemberRow>(
      `UPDATE members SET
        member_code = $2, member_type = $3, name = $4, phone = $5, email = $6,
        password = $7, tax_code = $8, representative = $9, role_label = $10, status = $11,
        exam_score = $12, cert_id = $13, progress_count = $14, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id, memberCode, memberType, name, phone ?? null, email ?? null,
        password ?? null, taxCode ?? null, representative ?? null, roleLabel,
        status, examScore ?? null, certId ?? null, progressCount ?? 0,
      ]
    );

    if (email && input.password && input.password.trim() !== "") {
      try {
        const hash = await hashPassword(input.password);
        await usersRepository.updatePasswordByEmail(email, hash);
      } catch (e) {
        /* best-effort sync */
      }
    }

    return rows[0] ?? null;
  },

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM members WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  },
};

export function toPublicMember(m: MemberRow) {
  return {
    id: m.id,
    memberCode: m.member_code,
    type: m.member_type,
    name: m.name,
    phone: m.phone,
    email: m.email,
    password: m.password || "",
    taxCode: m.tax_code,
    representative: m.representative,
    role: m.role_label,
    progressCount: m.progress_count,
    examScore: m.exam_score,
    status: m.status,
    certId: m.cert_id,
    joinedDate: m.joined_date,
  };
}

