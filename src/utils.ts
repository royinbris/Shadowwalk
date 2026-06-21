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
  
  const urlLine = project.isVideoLocal ? `URL: 로컬음원` : `URL: https://www.youtube.com/watch?v=${project.videoId}`;
  return `Title: ${project.title}\n${urlLine}\n\n${transcriptStr}`;
};

export const exportProject = async (project: Project) => {
  const fileName = `${project.title.replace(/[^a-zA-Z0-9가-힣\s-]/g, '_')}.json`;
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
      const sec = `${s.toString().padStart(2, '0')}.${srtTimeMatch[4]}`;

      const timeStr = h > 0
        ? `${h}:${m.toString().padStart(2, '0')}:${sec}`
        : `${m}:${sec}`;
      
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

export const parseTranscriptText = (textContent: string): TranscriptItem[] => {
  const processedInput = preprocessSrt(textContent);
  const lines = processedInput.split("\n");
  const items: TranscriptItem[] = [];
  let current: TranscriptItem | null = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    // 괄호 유무와 무관하게 줄 시작의 타임코드를 인식 (예: "(0:24.9) ..." / "0:24.9 ...")
    const timeMatch =
      trimmedLine.match(/^[(\[](\d+:?\d*:?[\d\.]*)[)\]]\s*(.*)$/) ||
      trimmedLine.match(/^(\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?)\s+(.+)$/);
    if (timeMatch) {
      const parts = timeMatch[1].split(":").map(Number);
      let seconds = 0;
      if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
      else seconds = parts[0];
      current = { text: timeMatch[2].trim(), offset: seconds, duration: 0 };
      items.push(current);
    } else {
      const isTitleLine = trimmedLine.toLowerCase().startsWith("title:");
      const isUrlLine = trimmedLine.toLowerCase().startsWith("url:");
      if (current && !isTitleLine && !isUrlLine) {
        if (!current.translation) current.translation = trimmedLine;
        else if (!current.grammar) current.grammar = trimmedLine;
        else current.grammar += "\n" + trimmedLine;
      }
    }
  });

  if (items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      const nextOffset = items[i + 1]?.offset || items[i].offset + 5;
      items[i].duration = Math.max(0.1, nextOffset - items[i].offset);
    }
  } else {
    items.push({ text: textContent, offset: 0, duration: 999999 });
  }
  return items;
};


