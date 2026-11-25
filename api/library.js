import { put, list, del } from '@vercel/blob';

const PREFIX = 'shadowwalk/';
const MAX_BYTES = 256 * 1024;
const validPath = (path) => typeof path === 'string' &&
  (/^shadowwalk\/projects\/[A-Za-z0-9_-]+\.[0-9a-f-]{36}\.json$/.test(path) ||
   /^shadowwalk\/texts\/[A-Za-z0-9_-]+-[^/]+\.txt$/.test(path));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return res.status(503).json({ error: 'Vercel Blob 저장소가 연결되지 않았습니다.' });
  }

  try {
    if (req.method === 'GET' && req.query.path) {
      const path = String(req.query.path);
      if (!validPath(path)) return res.status(400).json({ error: '잘못된 파일 경로입니다.' });
      const results = await list({ prefix: path, limit: 1 });
      const blob = results.blobs.find((item) => item.pathname === path);
      if (!blob) return res.status(404).json({ error: '파일이 없습니다.' });
      const response = await fetch(blob.url);
      if (!response.ok) throw new Error('파일을 읽지 못했습니다.');
      const content = await response.text();
      res.setHeader('Content-Type', path.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8');
      return res.status(200).send(content);
    }

    if (req.method === 'GET') {
      const entries = [];
      let cursor;
      do {
        const page = await list({ prefix: PREFIX, limit: 100, cursor });
        entries.push(...page.blobs.filter((blob) => validPath(blob.pathname)).map((blob) => ({
          pathname: blob.pathname,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          name: blob.pathname.split('/').pop(),
        })));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor && entries.length < 1000);
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BYTES) {
        return res.status(413).json({ error: '파일은 256KB 이하만 저장할 수 있습니다.' });
      }
      if (body.kind === 'project') {
        const project = body.project;
        if (!project || !/^[A-Za-z0-9_-]{1,100}$/.test(String(project.id)) ||
            typeof project.title !== 'string' || !project.title.trim() || project.title.length > 200 ||
            typeof project.videoId !== 'string' || project.videoId.length > 100 ||
            typeof project.createdAt !== 'number' || !Number.isFinite(project.createdAt) ||
            !Array.isArray(project.transcript) || project.transcript.length > 5000 ||
            !project.transcript.every((item) => item && typeof item.text === 'string' &&
              typeof item.offset === 'number' && Number.isFinite(item.offset) &&
              typeof item.duration === 'number' && Number.isFinite(item.duration))) {
          return res.status(400).json({ error: '올바른 JSON 프로젝트가 아닙니다.' });
        }
        const oldFiles = await list({ prefix: `${PREFIX}projects/${project.id}.`, limit: 100 });
        const pathname = `${PREFIX}projects/${project.id}.${crypto.randomUUID()}.json`;
        await put(pathname, JSON.stringify(project), { access: 'public', contentType: 'application/json', cacheControlMaxAge: 60 });
        if (oldFiles.blobs.length) await del(oldFiles.blobs.map((blob) => blob.pathname));
        return res.status(200).json({ pathname });
      }
      if (body.kind === 'text') {
        const name = String(body.name || 'script.txt');
        if (!name.toLowerCase().endsWith('.txt') || typeof body.content !== 'string') {
          return res.status(400).json({ error: 'TXT 파일만 저장할 수 있습니다.' });
        }
        const safeName = name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_').slice(0, 80);
        const pathname = `${PREFIX}texts/${crypto.randomUUID()}-${safeName}`;
        await put(pathname, body.content, { access: 'public', contentType: 'text/plain; charset=utf-8', cacheControlMaxAge: 60 });
        return res.status(200).json({ pathname });
      }
      return res.status(400).json({ error: '저장할 파일 형식이 잘못되었습니다.' });
    }

    if (req.method === 'DELETE') {
      const path = req.query.path;
      if (!validPath(path)) return res.status(400).json({ error: '잘못된 파일 경로입니다.' });
      await del(path);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: '지원하지 않는 요청입니다.' });
  } catch (error) {
    console.error('Cloud library error', error);
    return res.status(500).json({ error: '클라우드 저장소에 연결하지 못했습니다.' });
  }
}
