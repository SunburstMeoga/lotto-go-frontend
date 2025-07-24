const History = () => {
  return (
    <div 
      className="min-h-screen text-white p-4 pb-20"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-normal mb-6" style={{ color: 'var(--color-text-primary)' }}>
          交易历史
        </h1>
        
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-normal">暂无交易记录</p>
        </div>
      </div>
    </div>
  );
};

export default History;
