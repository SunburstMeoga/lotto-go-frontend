import { createContext, useContext, useState, useCallback } from 'react';

const PriceContext = createContext();

export const usePriceContext = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePriceContext must be used within a PriceProvider');
  }
  return context;
};

export const PriceProvider = ({ children }) => {
  const [currentPrice, setCurrentPrice] = useState(118735.3);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  const updatePrice = useCallback((price, change, changePercent) => {
    setCurrentPrice(price);
    setPriceChange(change);
    setPriceChangePercent(changePercent);
  }, []);

  return (
    <PriceContext.Provider value={{
      currentPrice,
      priceChange,
      priceChangePercent,
      updatePrice
    }}>
      {children}
    </PriceContext.Provider>
  );
};
