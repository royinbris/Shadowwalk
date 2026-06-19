import { Project, TranscriptItem } from './types';

export const extractVideoId = (url: string) => {
  // Extract content between brackets/parens if it's a markdown link
  const mdMatch = url.match(/\[.*?\]\((.*?)\)/);
  const cleanUrl = mdMatch ? mdMatch[1] : url;

  try {
    const urlObj = new URL(cleanUrl);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
  } catch (e) {
    // Fallback to regex
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s\)\]]{11})/i;
  const match = cleanUrl.match(regex);
  return match ? match[1] : null;
};

export const formatTranscriptToUnified = (project: Project) => {
  const transcriptStr = project.transcript
    .map(item => {
      const mins = Math.floor(item.offset / 60);
      const secs = (item.offset % 60).toFixed(1);
      const timeStr = `${mins}:${secs.padStart(4, '0')}`;
      let block = `(${timeStr}) ${item.text}`;
      if (item.translation) block += `\n${item.translation}`;
      if (item.grammar) block += `\n${item.grammar}`;
      return block;
    })
    .join('\n\n');
  
  return `Title: ${project.title}\nURL: https://www.youtube.com/watch?v=${project.videoId}\n\n${transcriptStr}`;
};

export const exportProject = async (project: Project) => {
  const fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  const content = JSON.stringify(project, null, 2);

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Project File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("File System Access API failed, falling back to legacy download", err);
    }
  }

  try {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Legacy download failed", err);
  }
};

export const printSubtitles = (items: TranscriptItem[], type: 'all' | 'en', title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const style = `
    <style>
      body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #000; }
      h1 { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
      .item { margin-bottom: 20px; page-break-inside: avoid; }
      .time { color: #666; font-size: 0.85em; margin-bottom: 4px; }
      .en { font-size: 1.1em; font-weight: bold; margin-bottom: 4px; }
      .ko { color: #333; margin-bottom: 4px; }
      .grammar { color: #555; background: #f9f9f9; padding: 8px; border-left: 4px solid #ddd; font-size: 0.9em; margin-bottom: 4px; }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    </style>
  `;

  const contentHtml = items.map((t) => {
    return `
      <div class="item">
        <div class="time">[${formatTime(t.offset)}]</div>
        <div class="en">${t.text}</div>
        ${type === 'all' && t.translation ? `<div class="ko">${t.translation}</div>` : ''}
        ${type === 'all' && t.grammar ? `<div class="grammar">${t.grammar.replace(/\\n/g, '<br/>')}</div>` : ''}
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print - ${title}</title>
        ${style}
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
          <button onclick="window.print()" style="padding: 8px 16px; font-size: 16px; cursor: pointer; background: #000; color: #fff; border: none; border-radius: 4px;">Print Now</button>
          <button onclick="window.close()" style="padding: 8px 16px; font-size: 16px; cursor: pointer; background: #666; color: #fff; border: none; border-radius: 4px;">Close</button>
        </div>
        <h1>${title || 'Subtitles'}</h1>
        ${contentHtml}
        <script>
          // Auto trigger print dialog when ready
          window.onafterprint = function() { window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const preprocessSrt = (text: string): string => {
  if (!text.includes("-->")) return text;

  let formatted = text.replace(/\[(Music|Laughter|Applause|Music)\]/gi, "");
  const lines = formatted.split("\n").map(l => l.trim()).filter(l => l);
  const isSrt = lines.some(l => l.includes("-->"));
  
  if (!isSrt) return text;

  const resultLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\d+$/.test(lines[i]) && lines[i+1] && lines[i+1].includes("-->")) {
      continue;
    }
    
    const srtTimeMatch = lines[i].match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->/);
    if (srtTimeMatch) {
      const h = parseInt(srtTimeMatch[1], 10);
      const m = parseInt(srtTimeMatch[2], 10);
      const s = parseInt(srtTimeMatch[3], 10);
      
      const timeStr = h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m}:${s.toString().padStart(2, '0')}`;
      
      const textArr = [];
      let j = i + 1;
      while(j < lines.length && !/^\d+$/.test(lines[j]) && !lines[j].includes("-->") && !lines[j].toLowerCase().startsWith("title:") && !lines[j].toLowerCase().startsWith("url:")) {
        textArr.push(lines[j]);
        j++;
      }
      
      resultLines.push(`(${timeStr}) ${textArr.join(" ")}`);
      i = j - 1; 
    } else {
      resultLines.push(lines[i]);
    }
  }
  return resultLines.join("\n");
};

let cachedDriveToken: string | null = null;
let tokenExpiresAt: number = 0;

export const GOOGLE_CLIENT_ID = "1001560043137-ulb2h8a3ohati1nluq7brf94k560ugfe.apps.googleusercontent.com";

export const getGoogleToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (cachedDriveToken && Date.now() < tokenExpiresAt - 60000) {
      return resolve(cachedDriveToken);
    }
    
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            cachedDriveToken = tokenResponse.access_token;
            const expiresIn = tokenResponse.expires_in ? parseInt(tokenResponse.expires_in, 10) : 3599;
            tokenExpiresAt = Date.now() + expiresIn * 1000;
            resolve(tokenResponse.access_token);
          } else {
            reject(new Error("Token response invalid"));
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

export const exportToGoogleDrive = async (project: Project) => {
  if (typeof window === 'undefined') return;

  const fileName = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  const content = JSON.stringify(project, null, 2);

  const FOLDER_NAME = '유튭영어';

  const getOrCreateDriveFolder = async (accessToken: string) => {
    const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const createData = await createRes.json();
    return createData.id;
  };

  const uploadFile = async (accessToken: string, folderId: string) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const metadata = {
      name: fileName,
      mimeType: contentType,
      parents: [folderId]
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      content +
      close_delim;

    try {
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody,
      });
      if (res.ok) {
        alert(`Google Drive '${FOLDER_NAME}' 폴더에 성공적으로 저장되었습니다!\\n파일 이름: ${fileName}`);
      } else {
        const err = await res.text();
        console.error("Failed to upload to Google Drive", err);
        alert("Google Drive 업로드에 실패했습니다: " + err);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Google Drive 업로드 중 오류가 발생했습니다.");
    }
  };

  if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.oauth2) {
    try {
      const accessToken = await getGoogleToken();
      const folderId = await getOrCreateDriveFolder(accessToken);
      await uploadFile(accessToken, folderId);
    } catch (err) {
      console.error("Failed to get token or export to Google Drive", err);
      alert("Google Drive 인증 오류 또는 업로드 실패가 발생했습니다.");
    }
  } else {
    alert("Google Identity Services 로딩 중입니다. 잠시 후 다시 시도해주세요.");
  }
};

export const fetchGoogleDriveFiles = async (accessToken: string) => {
  const FOLDER_NAME = '유튭영어';
  const queryFolder = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryFolder)}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const folderData = await folderRes.json();
  if (!folderData.files || folderData.files.length === 0) {
    return []; // Folder doesn't exist yet
  }
  const folderId = folderData.files[0].id;

  const query = `'${folderId}' in parents and mimeType='application/json' and trashed=false`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  return data.files || [];
};

export const downloadGoogleDriveFile = async (accessToken: string, fileId: string) => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error("Failed to download file");
  const text = await res.text();
  return JSON.parse(text);
};

