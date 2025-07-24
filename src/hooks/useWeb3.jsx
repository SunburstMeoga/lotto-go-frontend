import { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Web3 Context
const Web3Context = createContext();

// 链配置
const CHAIN_CONFIG = {
  chainId: `0x${parseInt(import.meta.env.VITE_CHAIN_ID).toString(16)}`,
  chainName: import.meta.env.VITE_CHAIN_NAME,
  rpcUrls: [import.meta.env.VITE_RPC_URL],
  blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER],
  nativeCurrency: {
    name: import.meta.env.VITE_NATIVE_CURRENCY_NAME,
    symbol: import.meta.env.VITE_NATIVE_CURRENCY_SYMBOL,
    decimals: parseInt(import.meta.env.VITE_NATIVE_CURRENCY_DECIMALS)
  }
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  // 检查是否安装了MetaMask
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // 检查链是否正确
  const checkChain = (currentChainId) => {
    const targetChainId = parseInt(import.meta.env.VITE_CHAIN_ID);
    const currentChainIdDecimal = parseInt(currentChainId, 16);
    const isCorrect = currentChainIdDecimal === targetChainId;
    setIsCorrectChain(isCorrect);
    return isCorrect;
  };

  // 切换到正确的链
  const switchToCorrectChain = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainId }],
      });
      return true;
    } catch (switchError) {
      // 如果链不存在，尝试添加
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('添加网络失败:', addError);
          toast.error('添加网络失败');
          return false;
        }
      } else {
        console.error('切换网络失败:', switchError);
        toast.error('切换网络失败');
        return false;
      }
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('请安装MetaMask钱包');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      // 请求连接账户
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();

        setAccount(accounts[0]);
        setProvider(web3Provider);
        setSigner(web3Signer);
        setChainId(network.chainId.toString());

        // 检查链是否正确
        const isCorrect = checkChain(network.chainId.toString(16));
        if (!isCorrect) {
          toast.error(`请切换到${import.meta.env.VITE_CHAIN_NAME}`);
        } else {
          toast.success('钱包连接成功');
        }
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      toast.error('连接钱包失败');
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开连接
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsCorrectChain(false);
    toast.success('钱包已断开连接');
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16).toString());
        checkChain(chainId);
        window.location.reload(); // 链变化时刷新页面
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // 自动连接（如果之前已连接）
  useEffect(() => {
    const autoConnect = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const web3Signer = await web3Provider.getSigner();
            const network = await web3Provider.getNetwork();

            setAccount(accounts[0]);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setChainId(network.chainId.toString());
            checkChain(network.chainId.toString(16));
          }
        } catch (error) {
          console.error('自动连接失败:', error);
        }
      }
    };

    autoConnect();
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectChain,
    isMetaMaskInstalled,
    connectWallet,
    disconnect,
    switchToCorrectChain,
    CHAIN_CONFIG
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
