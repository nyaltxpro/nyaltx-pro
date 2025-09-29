import EmailTest from '@/components/EmailTest';

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Email Newsletter Test</h1>
          <p className="text-gray-400">Test the newsletter signup functionality</p>
        </div>
        
        <EmailTest />
        
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Setup Instructions</h2>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>1. Configure Environment Variables:</strong></p>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@nyaltx.io
ADMIN_EMAIL=admin@nyaltx.io`}
            </pre>
            
            <p><strong>2. Gmail Setup:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enable 2-factor authentication</li>
              <li>Generate App Password (not regular password)</li>
              <li>Use App Password in SMTP_PASS</li>
            </ul>
            
            <p><strong>3. Test the functionality:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enter email and optional name</li>
              <li>Click "Test Subscribe"</li>
              <li>Check email inbox (and spam folder)</li>
              <li>Verify admin notification email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
