import { z } from 'zod';
import { authRequest } from '@/lib/auth-request';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const updateInput = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  is_done: z.boolean().optional()
}).strict().refine(data => data.title !== undefined || data.is_done !== undefined, {
  message: "Phải cung cấp title hoặc is_done"
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);

  const { id } = await params;
  const parsed = updateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Dữ liệu không hợp lệ' }, 400);

  const { data, error } = await auth.db.from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select('id,title,is_done,created_at')
    .maybeSingle();

  if (error) return json({ error: 'Lỗi máy chủ' }, 500);
  if (!data) return json({ error: 'Không tìm thấy dòng hoặc không có quyền' }, 404);

  return json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);

  const { id } = await params;
  const { data, error } = await auth.db.from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select('id')
    .maybeSingle();

  if (error) return json({ error: 'Lỗi máy chủ' }, 500);
  if (!data) return json({ error: 'Không tìm thấy dòng hoặc không có quyền' }, 404);

  return json({ data: { id } });
}