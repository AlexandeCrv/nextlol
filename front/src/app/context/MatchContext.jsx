"use client";
// MatchContext.js
import { createContext, useState, useContext } from "react";

// Criação do contexto
const MatchContext = createContext();

// Hook para facilitar o uso do contexto
export const useMatchContext = () => useContext(MatchContext);

// Componente que provê o contexto para a aplicação
export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState([]);
  const [championData, setChampionData] = useState({});
  const [participants, setParticipants] = useState([]);
  const [name, setname] = useState("");

  return (
    <MatchContext.Provider
      value={{
        matches,
        setMatches,
        championData,
        setChampionData,
        participants,
        setParticipants,
        name,
        setname,
        matchDetails,
        setMatchDetails,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
