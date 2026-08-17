import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="content" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>404 - Page Not Found</h2>
      <p style={{ color: 'var(--text-2)', marginTop: '8px' }}>The requested page could not be found.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
        Return to People Directory
      </Link>
    </div>
  );
}
