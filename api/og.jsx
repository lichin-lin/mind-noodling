import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'Mind noodling';
    const description = searchParams.get('description') || 'A collection of experiments and notes';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0a',
            padding: '80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#888888',
                maxWidth: '800px',
              }}
            >
              {description}
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#666666',
            }}
          >
            mind-noodling.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
