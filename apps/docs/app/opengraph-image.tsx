import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
        fontFamily: 'Arial, sans-serif',
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
            maxWidth: 950,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1.08,
          }}
        >
          Own your content.
          <br />
          Improve how it ships.
        </span>
      </div>
      <div style={{ width: '100%', height: 1, background: '#d9ded9' }} />
    </div>,
    size,
  );
}
