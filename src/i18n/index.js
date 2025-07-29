import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻译资源
const resources = {
  en: {
    translation: {
      // Navbar
      "connectWallet": "Connect Wallet",
      "connecting": "Connecting...",
      
      // BottomNav
      "trade": "Trade",
      "history": "History",
      "account": "Account",
      
      // Trading Page
      "tradeAmount": "Trade Amount",
      "balance": "Balance",
      "payout": "Payout",
      "up": "Up",
      "down": "Down",
      
      // History Page
      "tradeHistory": "Trade History",
      "tradingAsset": "Trading Asset",
      "loadMore": "Load More",
      "loading": "Loading...",
      "noTradeRecords": "No trade records",
      
      // Account Page
      "pleaseConnectWallet": "Please connect wallet",
      
      // Language
      "language": "Language",
      "english": "English",
      "chinese": "中文",
      "korean": "한국어"
    }
  },
  zh: {
    translation: {
      // Navbar
      "connectWallet": "连接钱包",
      "connecting": "连接中...",

      // BottomNav
      "trade": "交易",
      "history": "历史",
      "account": "账户",

      // Trading Page
      "tradeAmount": "交易金额",
      "balance": "余额",
      "payout": "赔率",
      "up": "看涨",
      "down": "看跌",

      // History Page
      "tradeHistory": "交易历史",
      "tradingAsset": "交易资产",
      "loadMore": "加载更多",
      "loading": "加载中...",
      "noTradeRecords": "暂无交易记录",

      // Account Page
      "pleaseConnectWallet": "请连接钱包",

      // Language
      "language": "语言",
      "english": "English",
      "chinese": "中文",
      "korean": "한국어"
    }
  },
  ko: {
    translation: {
      // Navbar
      "connectWallet": "지갑 연결",
      "connecting": "연결 중...",

      // BottomNav
      "trade": "거래",
      "history": "기록",
      "account": "계정",

      // Trading Page
      "tradeAmount": "거래 금액",
      "balance": "잔액",
      "payout": "배당률",
      "up": "상승",
      "down": "하락",

      // History Page
      "tradeHistory": "거래 기록",
      "tradingAsset": "거래 자산",
      "loadMore": "더 보기",
      "loading": "로딩 중...",
      "noTradeRecords": "거래 기록이 없습니다",

      // Account Page
      "pleaseConnectWallet": "지갑을 연결해주세요",

      // Language
      "language": "언어",
      "english": "English",
      "chinese": "中文",
      "korean": "한국어"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
