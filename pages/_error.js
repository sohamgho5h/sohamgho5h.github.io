// Minimal custom error page for Next.js Pages Router
export default function Error({ statusCode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#fff' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#333' }}>Oops!</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '1rem' }}>
        {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
      </h2>
      <p style={{ color: '#888' }}>Sorry, something went wrong. Please try refreshing the page.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
