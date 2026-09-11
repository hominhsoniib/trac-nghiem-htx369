import { pool } from "../../db/pool";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "user" | "admin";
  email_verified_at: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export const usersRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ?? null;
  },

  async create(params: { email: string; passwordHash: string; name: string }): Promise<UserRow> {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *`,
      [params.email, params.passwordHash, params.name]
    );
    return rows[0];
  },

  async updateName(id: string, name: string): Promise<UserRow> {
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET name = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, name]
    );
    return rows[0];
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await pool.query(`UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`, [id, passwordHash]);
  },
};

export function toPublicUser(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    emailVerified: u.email_verified_at !== null,
    createdAt: u.created_at,
  };
}
