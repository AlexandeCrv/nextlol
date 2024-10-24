"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { faztudo } from "../../../services/riot.service";
import { getMatchDetailsById } from "../../../services/riot.service";
import { getMatchHistoryByPuuid } from "../../../services/riot.service";
import { getSummonerByPuuid } from "../../../services/riot.service";
import { getSummonerByNameAndTag } from "../../../services/riot.service";
import AsideComponent from "../components/AsideComponent";
import { HoverItem } from "../components/HoverItem";
import { useSearchParams } from "next/navigation";

import { useMatchContext } from "../context/MatchContext";
function Perfil() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const tag = searchParams.get("tag");
  const { setMatches, setChampionData, setname, setMatchDetails } =
    useMatchContext();
  const [chanpionsData, setChampionsData] = useState({});
  const [datas, setDatas] = useState({});
  const [historicoCarregado, setHistoricoCarregado] = useState(false); // Novo estado

  const [hovver4, sethovver4] = useState(false);
  const [profileIcons, setProfileIcons] = useState([]); // Estado para armazenar os ícones de perfil

  const getProfileIconPath = (profileIconId) => {
    const matchingIcon = profileIcons.find((icon) => icon.id === profileIconId);
    return matchingIcon
      ? `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${matchingIcon.image.full}`
      : `/coisaslol/iconperfil/${profileIconId}.png`;
  };
  const getChampionImage = (championId) => {
    if (chanpionsData) {
      const champion = Object.values(chanpionsData).find(
        (champ) => champ.key === championId.toString()
      );
      return champion
        ? `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/champion/${champion.image.full}`
        : null;
    }
    return null;
  };

  const getTierElosImages = (tier) => {
    switch (tier) {
      case "IRON":
        return "iron.png";
      case "SILVER":
        return "silver.png";
      case "GOLD":
        return "gold.png";
      case "PLATINUM":
        return "platinum.png";
      case "EMERALD":
        return "esmerald.png";
      case "DIAMOND":
        return "diamond.png";
      case "MASTER":
        return "master.png";
      case "GRANDMASTER":
        return "grandmaster.png";
      case "CHALLENGER":
        return "challenger.png";
      default:
        return "unranked.png";
    }
  };
  const winrate = (wins, losses) => {
    return Math.round((wins / (wins + losses)) * 100) + "%";
  };
  useEffect(() => {
    const fetchData = async () => {
      if (name && tag) {
        try {
          const data = await faztudo(name, tag);
          setname(name);
          setDatas(data);

          // Busca dos dados dos campeões
          const championResponse = await fetch(
            "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/champion.json"
          );
          const championJson = await championResponse.json();
          setChampionsData(championJson.data); // Usando o contexto aqui

          // Ícones de perfil
          const profileIconResponse = await fetch(
            "https://ddragon.leagueoflegends.com/cdn/14.17.1/data/en_US/profileicon.json"
          );
          const profileIconJson = await profileIconResponse.json();
          setProfileIcons(Object.values(profileIconJson.data));

          // Dados do invocador e histórico de partidas
          const summonerData = await getSummonerByNameAndTag(name, tag);
          const puuid = summonerData.puuid;

          const hist = await getMatchHistoryByPuuid(puuid);
          if (hist && hist.length > 0) {
            const matchDetails = await Promise.all(
              hist.slice(0, 10).map((id) => getMatchDetailsById(id))
            );
            setMatches(matchDetails); // Armazena no contexto
            setMatchDetails(matchDetails); // Armazena no contexto

            console.log(matchDetails);
            setHistoricoCarregado(true);
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
    };

    fetchData();
  }, [name, tag, setMatches, setChampionData]);
  const changeName = (queueType) => {
    if (queueType === "CHERRY") {
      return "2v2";
    } else if (queueType === "RANKED_SOLO_5x5") {
      return "Solo/duo";
    } else if (queueType === "RANKED_FLEX_SR") {
      return "Flex 5v5";
    }
    return queueType;
  };

  const handleGoToHistorico = () => {
    if (historicoCarregado) {
      router.push("/historico");
    }
  };

  return (
    <div className="h-screen flex justify-between ">
      <AsideComponent datas={datas} getProfileIconPath={getProfileIconPath} />

      <main className="bg-fundo-perfil bg-cover h-screen w-full  shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
          <div className="flex justify-between   w-96 ml-64">
            <div>
              <Link
                href={"/perfil"}
                className={`${
                  location.pathname === "/perfil"
                    ? "text-white font-bold border-b-2 border-yellow-500"
                    : "text-gray-300"
                } hover:text-gray-100`}
              >
                VISÃO GERAL
              </Link>
            </div>

            <button onClick={handleGoToHistorico}>
              {historicoCarregado ? (
                <p>HISTÓRICO</p>
              ) : (
                ((<p className="loading-spinner"></p>), "CARREGANDO...")
              )}
            </button>
          </div>
        </div>
        <div className="text-white text-end  w-3/4 ml-64 mt-96 h-52">
          <div className="flex justify-between text-center">
            <div>
              {datas.elo && datas.elo.length > 0 ? (
                <HoverItem
                  content={
                    <div className="flex justify-between text-center left-40 ">
                      {datas.elo.map((eloData, index) => (
                        <div key={index} className="  h-60">
                          <p>{changeName(eloData.queueType)}</p>
                          <img
                            className="w-32"
                            src={getTierElosImages(eloData.tier)}
                            alt={eloData.tier}
                          />
                          <div>
                            <h3>
                              {eloData.tier} {eloData.rank}
                            </h3>
                            <p>Pontos: {eloData.leaguePoints}</p>
                            <p className="text-sm opacity-50">
                              Wins/Lose: {eloData.wins}-{eloData.losses}
                            </p>
                            <p className="text-sm opacity-50">
                              WinRate: {winrate(eloData.wins, eloData.losses)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div>
                    <img
                      className="w-32"
                      src={getTierElosImages(datas.elo[0].tier)}
                      alt={datas.elo[0].tier}
                    />
                    <div>
                      <h3>
                        <p>{changeName(datas.elo[0].queueType)}</p>
                        {datas.elo[0].tier} {datas.elo[0].rank}
                      </h3>
                    </div>
                  </div>
                </HoverItem>
              ) : (
                <div className="relative">
                  <img className="w-32 " src="/unranked.png" alt="" />
                  <div className="loading-spinner absolute top-12 right-0 left-0"></div>
                </div>
              )}
            </div>
            <div>
              <HoverItem
                content={
                  <div>
                    <h1>
                      Honra é o que define a quantidade fragmentos de chave que
                      você recebe no perfil. <br />
                    </h1>
                    <p>
                      Ele tambem define se você ganha ou não a skin limitada de
                      honra no final dos splits, Então se comporte!
                    </p>
                    <h6 className="text-xs opacity-50">
                      {" "}
                      (A Api da riot não fornece o nível de honra, a imagem e o
                      nível são meramente iluistrativos. )
                    </h6>
                    <figure className="text-center">
                      <img
                        className="w-32 m-auto"
                        src="/poroamigo.png"
                        alt=""
                      />
                    </figure>
                  </div>
                }
              >
                {datas && datas.elo ? (
                  <div>
                    <img className="w-32" src="/honra.png" alt="Honra" />
                    <div>
                      <p>Honra</p>
                      <p>Nivel 3</p>
                    </div>
                  </div>
                ) : (
                  <p className="loading-spinner"></p>
                )}
              </HoverItem>
            </div>

            <div>
              <HoverItem
                content={
                  <div>
                    <h1>Top 3 Maestrias</h1>
                    <div>
                      {datas && datas.maestria ? (
                        <div>
                          {(() => {
                            const championId = datas.maestria[1].championId;
                            const championId2 = datas.maestria[2].championId;
                            const imageUrl = getChampionImage(championId);
                            const imageUrl2 = getChampionImage(championId2);

                            return (
                              <div className="flex justify-around">
                                <div className="">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={`Champion ${championId}`}
                                    />
                                  ) : (
                                    <p>Champion image not found</p>
                                  )}
                                  <p>
                                    Nível de maestria:
                                    {datas.maestria[1].championLevel}
                                  </p>
                                  <p className="text-sm opacity-50">
                                    Pontos: {datas.maestria[1].championPoints}
                                  </p>
                                  <div className=" flex justify-center items-center ">
                                    <img
                                      className="w-16 "
                                      src="/maestria2.png"
                                      alt=""
                                    />
                                  </div>
                                </div>

                                <div>
                                  {" "}
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl2}
                                      alt={`Champion ${championId2}`}
                                    />
                                  ) : (
                                    <p>Champion image not found</p>
                                  )}
                                  <p>
                                    Nível de maestria:
                                    {datas.maestria[2].championLevel}
                                  </p>
                                  <p className="text-sm opacity-50">
                                    Pontos: {datas.maestria[2].championPoints}
                                  </p>
                                  <div className=" flex justify-center items-center ">
                                    <img
                                      className="w-16 "
                                      src="/maestria3.png"
                                      alt=""
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="loading-spinner"></p>
                      )}
                    </div>
                  </div>
                }
              >
                {datas && datas.maestria ? (
                  <div>
                    {(() => {
                      const championId = datas.maestria[0].championId;
                      const imageUrl = getChampionImage(championId);

                      return (
                        <div>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`Champion ${championId}`}
                            />
                          ) : (
                            <p>Champion image not found</p>
                          )}
                          <div>
                            <p>
                              Nível de maestria:
                              {datas.maestria[0].championLevel}
                            </p>
                            <p className="text-sm opacity-50">
                              Pontos: {datas.maestria[0].championPoints}
                            </p>
                            <div className=" flex justify-center items-center ">
                              <img
                                className="w-16 "
                                src="/maestria.png"
                                alt=""
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="loading-spinner"></p>
                )}
              </HoverItem>
            </div>

            <div
              onMouseEnter={() => sethovver4(true)} // Definindo 'hovver' como verdadeiro ao passar o mouse
              onMouseLeave={() => sethovver4(false)} // Definindo 'hovver' como falso ao sair com o mouse
              className={`relative ${hovver4 ? "shadow-lg" : ""}`} // Adicionando a classe para o efeito de luz
            >
              {hovver4 && (
                <div>
                  <div
                    className="absolute bottom-52  transform -translate-x-1/2 w-64 h-56 shadow-md p-2 rounded-lg ml-32 z-50 flex justify-around"
                    style={{
                      backgroundColor: "#1a1c21",
                      width: "150px",
                      height: "225px",
                      border: "2px solid #785a28",
                      left: "-50px",
                    }}
                  >
                    <div
                      className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8"
                      style={{
                        borderTopColor: "#1a1c21",
                        // Cor da seta
                        bottom: "-8px",
                        left: "25%",
                        transform: "translateX(-50%)",
                      }}
                    />
                    <div>
                      <p>
                        Trofeu Monte Targon é a marca da conquista do campeonato
                        mensal{" "}
                        <a
                          className="text-blue-500 hover:shadow-blue-500 "
                          href="https://support-leagueoflegends.riotgames.com/hc/pt-br/articles/360000951548-Clash-Perguntas-Frequentes"
                          target="_blank"
                        >
                          "CLASH"
                        </a>{" "}
                        de legue of legends!
                      </p>
                      <h6 className="text-xs opacity-50">
                        {" "}
                        (A Api da riot não fornece os trofeus do clash, a imagem
                        é meramente iluistrativa. )
                      </h6>
                    </div>
                  </div>
                </div>
              )}
              {datas && datas.elo ? (
                <div>
                  <img className="w-36" src="/trofeu.png" alt="Honra" />
                  <div className="leading-4">
                    <p>Trofeu Monte Targon</p>
                    <p>Tier 1</p>
                    <p>12 Equipes</p>
                  </div>
                </div>
              ) : (
                <p className="loading-spinner"></p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Perfil;
