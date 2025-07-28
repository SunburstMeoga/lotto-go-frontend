import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import ChainSwitchModal from './ChainSwitchModal';

const ChainChecker = ({ children }) => {
  const { account, isCorrectChain, chainId } = useWeb3();
  const [showChainSwitchModal, setShowChainSwitchModal] = useState(false);

  useEffect(() => {
    // 只有在用户已连接钱包且链不正确时才显示弹窗
    if (account && chainId && !isCorrectChain) {
      setShowChainSwitchModal(true);
    } else {
      setShowChainSwitchModal(false);
    }
  }, [account, isCorrectChain, chainId]);

  return (
    <>
      {children}
      <ChainSwitchModal
        isOpen={showChainSwitchModal}
        onClose={() => setShowChainSwitchModal(false)}
      />
    </>
  );
};

export default ChainChecker;
