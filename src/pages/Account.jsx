const Account = () => {
  return (
    <div 
      className="min-h-screen text-white p-4 pb-20"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-normal mb-6" style={{ color: 'var(--color-text-primary)' }}>
          账户
        </h1>
        
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-400 font-normal">请连接钱包</p>
        </div>
      </div>
    </div>
  );
};

export default Account;
