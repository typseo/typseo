import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Typseo Docs: Own your content. Improve how it ships.';

export default async function OpenGraphImage() {
  const fontsDirectory = join(process.cwd(), 'assets', 'fonts');
  const [geistRegular, geistBold] = await Promise.all([
    readFile(join(fontsDirectory, 'Geist-Regular.ttf')),
    readFile(join(fontsDirectory, 'Geist-Bold.ttf')),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 72,
        background: '#f9f9f7',
        color: '#171a18',
        fontFamily: 'Geist',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 54,
            height: 54,
            border: '2px solid #171a18',
            borderRadius: 14,
            fontFamily: 'Georgia, serif',
            fontSize: 42,
          }}
        >
          t
        </span>
        typseo <span style={{ color: '#747975', fontWeight: 400 }}>/ docs</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span
          style={{
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#626965',
          }}
        >
          Open-source editor & SEO toolkit
        </span>
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.08,
          }}
        >
          <span>Own your content.</span>
          <span>Improve how it ships.</span>
        </span>
      </div>
      <div style={{ width: '100%', height: 1, background: '#d9ded9' }} />
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist', data: geistRegular, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
