import React, { useState, createContext } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [siteData, setSiteData] = useState({});

  return (
    <AppContext.Provider
      value={{
        searchValue,
        setSearchValue,
        siteData,
        setSiteData,
        user,
        setUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
