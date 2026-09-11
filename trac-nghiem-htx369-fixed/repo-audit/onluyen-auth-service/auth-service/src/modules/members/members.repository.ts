import { pool } from "../../db/pool";

export type MemberRow = {
  id: string;
  member_code: string;
  member_type: "ca_nhan" | "phap_nhan";
  name: string;
  phone: string | null;
  email: string | null;
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
        (member_code, member_type, name, phone, email, tax_code, representative, role_label, status, exam_score, cert_id, progress_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        input.memberCode, input.type, input.name, input.phone ?? null, input.email ?? null,
        input.taxCode ?? null, input.representative ?? null, input.role ?? "Thành viên HTX 369",
        input.status, input.examScore ?? null, input.certId ?? null, input.progressCount ?? 0,
      ]
    );
    return rows[0];
  },

  async update(id: string, input: MemberInput): Promise<MemberRow | null> {
    const { rows } = await pool.query<MemberRow>(
      `UPDATE members SET
        member_code = $2, member_type = $3, name = $4, phone = $5, email = $6,
        tax_code = $7, representative = $8, role_label = $9, status = $10,
        exam_score = $11, cert_id = $12, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id, input.memberCode, input.type, input.name, input.phone ?? null, input.email ?? null,
        input.taxCode ?? null, input.representative ?? null, input.role ?? "Thành viên HTX 369",
        input.status, input.examScore ?? null, input.certId ?? null,
      ]
    );
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
