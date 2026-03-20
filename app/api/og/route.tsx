import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #162a4a 70%, #1a3358 100%)',
          position: 'relative',
        }}
      >
        {/* Earth-like arc at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-100px',
            right: '-100px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center top, #1e5a8a 0%, #143d6b 30%, #0a1628 70%)',
            display: 'flex',
          }}
        />
        {/* Atmosphere glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '180px',
            left: '0',
            right: '0',
            height: '80px',
            background: 'linear-gradient(0deg, rgba(100,180,255,0.15) 0%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              fontSize: '96px',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              fontFamily: 'sans-serif',
            }}
          >
            The Human
          </span>
          <span
            style={{
              fontSize: '96px',
              fontWeight: 900,
              color: '#E8B84B',
              lineHeight: 1,
              fontFamily: 'sans-serif',
            }}
          >
            Movement.
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
            fontFamily: 'sans-serif',
          }}
        >
          Social media took our kids. AI is coming for our jobs, agency, and future.
        </span>

        {/* URL */}
        <span
          style={{
            fontSize: '22px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '40px',
            letterSpacing: '4px',
            fontFamily: 'sans-serif',
          }}
        >
          HUMAN.MOV
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
