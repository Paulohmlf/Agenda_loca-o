import React, { createContext, ReactNode, useContext, useState } from 'react';

type CarrosContextType = {
  refreshCarros: boolean;
  setRefreshCarros: (value: boolean) => void;
};

const CarrosContext = createContext<CarrosContextType>({
  refreshCarros: false,
  setRefreshCarros: () => {},
});

export const useCarrosContext = () => useContext(CarrosContext);

export const CarrosProvider = ({ children }: { children: ReactNode }) => {
  const [refreshCarros, setRefreshCarros] = useState(false);

  return (
    <CarrosContext.Provider value={{ refreshCarros, setRefreshCarros }}>
      {children}
    </CarrosContext.Provider>
  );
};
