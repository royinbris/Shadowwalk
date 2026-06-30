import axios from 'axios';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // OPTIONS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const isStream = req.body && req.body.stream;

    // axios를 사용하여 OpenCode Zen API 호출
    const response = await axios({
      method: req.method,
      url: 'https://opencode.ai/zen/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      data: req.body,
      responseType: isStream ? 'stream' : 'json'
    });

    if (isStream) {
      // 스트리밍 응답 설정 및 파이핑
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.data.pipe(res);
    } else {
      // 비스트리밍인 경우 json 응답 반환
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    console.error('Serverless proxy error:', error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: error.message };
    res.status(status).json(data);
  }
}
