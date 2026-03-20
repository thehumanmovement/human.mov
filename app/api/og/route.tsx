import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  // Load Oswald font (matches website)
  const oswaldBold = await fetch(
    new URL('https://fonts.gstatic.com/s/oswald/v53/TK3iWkUHHAIjg752GT8Dl-1PKw.woff2')
  ).then((res) => res.arrayBuffer())

  const interRegular = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2')
  ).then((res) => res.arrayBuffer())

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
          background: '#080c18',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Earth arc */}
        <div
          style={{
            position: 'absolute',
            bottom: '-320px',
            left: '-200px',
            width: '1600px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 50% 20%, #1a4a7a 0%, #0f2d52 25%, #091c38 50%, #060e1c 75%)',
            display: 'flex',
          }}
        />
        {/* Atmosphere glow line */}
        <div
          style={{
            position: 'absolute',
            bottom: '235px',
            left: '-50px',
            width: '1300px',
            height: '4px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(120,180,255,0.4) 30%, rgba(120,180,255,0.5) 50%, rgba(120,180,255,0.4) 70%, transparent 100%)',
            display: 'flex',
          }}
        />
        {/* Atmosphere haze */}
        <div
          style={{
            position: 'absolute',
            bottom: '200px',
            left: '0',
            right: '0',
            height: '100px',
            background: 'linear-gradient(0deg, rgba(80,150,240,0.08) 0%, transparent 100%)',
            display: 'flex',
          }}
        />
        {/* Cloud-like patches on earth */}
        <div
          style={{
            position: 'absolute',
            bottom: '260px',
            left: '200px',
            width: '300px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(200,220,255,0.06)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '280px',
            right: '150px',
            width: '250px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(200,220,255,0.05)',
            display: 'flex',
          }}
        />

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
            marginTop: '-40px',
          }}
        >
          <span
            style={{
              fontSize: '108px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.05,
              fontFamily: 'Oswald',
              textTransform: 'uppercase' as const,
              letterSpacing: '-1px',
            }}
          >
            The Human
          </span>
          <span
            style={{
              fontSize: '108px',
              fontWeight: 700,
              color: '#E8B84B',
              lineHeight: 1.05,
              fontFamily: 'Oswald',
              textTransform: 'uppercase' as const,
              letterSpacing: '-1px',
            }}
          >
            Movement.
          </span>
        </div>

        {/* Join Now button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E8B84B',
            borderRadius: '999px',
            padding: '16px 64px',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#080c18',
              fontFamily: 'Oswald',
              textTransform: 'uppercase' as const,
              letterSpacing: '2px',
            }}
          >
            Join Now
          </span>
        </div>

        {/* Human.mov */}
        <span
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '6px',
            fontFamily: 'Inter',
            textTransform: 'uppercase' as const,
          }}
        >
          Human.mov
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Oswald',
          data: oswaldBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )
}
