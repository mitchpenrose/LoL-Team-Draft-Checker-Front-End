import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Select from 'react-select';
import * as styles from './styles.js';
import ChampionImage from './Components/ChampionImage.js';
import SplashArt from './Components/SplashArt.js';
import * as appState from './Utils/AppState.js';


function App() {
  const [json, setJson] = useState({});
  const [tierData, setTierData] = useState([]);
  const [counterData, setCounterData] = useState([]);
  const [summonerData, setSummonerData] = useState([]);
  const [currentSelectedChampion, setCurrentSelectedChampion] = useState(undefined);
  const [selectedChampions, setSelectedChampions] = useState(["", "", "", "", "", "", "", "", "", ""]);
  const [summoners, setSummoners] = useState(["", "", "", "", ""]);
  const [dragIndex, setDragIndex] = useState(0);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [draggedChampionIndex, setDraggedChampionIndex] = useState(-1);

  useEffect(() => {
    getJSON();
    getTierData();
    getCounterData();
    setLoaderVisible(true);
  }, []);

  useEffect(() => {
    if (allDataLoaded()) {
      setLoaderVisible(false);
    }
  }, [json, tierData, counterData])

  useEffect(() => {
    if (summonerData.length > 0) {
      setLoaderVisible(false);
      console.log("summonerData", summonerData);
      console.log(summonerData.length);
    }
  }, [summonerData])

  const getJSON = () => {
    fetch("http://ddragon.leagueoflegends.com/cdn/" + appState.getCurrentVersion() + "/data/en_US/champion.json").then(async (response) => {
      setJson(await response.json());
    })
  }

  const getTierData = () => {
    fetch("/data/getTierData").then(async (response) => {
      setTierData(await response.json());
    })
  }

  const getCounterData = () => {
    fetch("/data/getCounterData").then(async (response) => {
      setCounterData(await response.json());
    })
  }

  const getSummonerData = () => {
    if (summoners[0] !== "" && summoners[1] !== "" && summoners[2] !== "" && summoners[3] !== "" && summoners[4] !== "" && !loaderVisible) {
      console.log("fetching")
      setLoaderVisible(true);
      fetch("/data/getData?topSum=" + summoners[0] + "&jungleSum=" + summoners[1] + "&middleSum=" + summoners[2] + "&adcSum=" + summoners[3] + "&supportSum=" + summoners[4]).then(async (response) => {
        let sd = await response.json();
        sortSummonerData(sd)
      })
    }
  }

  const sortSummonerData = (sd) => {
    //debugger
    let sortedData = []
    for (let i = 0; i < 5; i++) {
      let data = sd.find((data) => { return data.summonerName.toLowerCase().replace(/\s/g, '') === summoners[i].toLowerCase().replace(/\s/g, '') })
      sortedData.push(data);
    }
    console.log(sortedData);
    console.log(summonerData);
    setSummonerData(sortedData);
  }

  const allDataLoaded = () => {
    return (Object.keys(json).length > 0 && counterData.length > 0 && tierData.length > 0);
  }

  const getChampionNames = (position, opponent) => {
    if (!allDataLoaded())
      return [];
    let names = Object.keys(json.data).map((key) => {
      let championName = json.data[key].name + (position === undefined ? "" : getChampionTier(position, json.data[key].name) + (opponent === "" || opponent === undefined ? "" : " "+getChampionWinRateData(position, opponent.value.toLowerCase(), json.data[key].id.toLowerCase())));
      let championId = json.data[key].id;
      return { value: championId, label: championName }
    })

    names.sort((a,b) => {return (a.label.includes("(") ? parseInt(a.label.split("(")[1].replace(")", "")) : 1000) - (b.label.includes("(") ? parseInt(b.label.split("(")[1].replace(")", "")) : 1000)})
    //names.sort((a,b) => {return a-b})
    return names;
  }

  const getChampionWinRateData = (position, opponentChampion, championName) => {
    let opponentCounterData = counterData.find((cd) => {
      return (cd.Role === position && cd.ChampionName === opponentChampion)
    })
    if(opponentCounterData === undefined)
      return "";
    let championCounterData = opponentCounterData.Counters.find((counter) => {
      return counter.Champion === championName
    })
    if(championCounterData === undefined)
      return "";
    return 100 - parseFloat(championCounterData.WinPercent.replace("%", "")) + "%";
  }

  const getChampionTier = (position, championName) => {
    let positionTierData = tierData.find((td) => {
      return td.Position === position
    })
    let championTierData = positionTierData["ChampionTiers"].find((champ) => {
      return champ.ChampionName === championName
    })

    if(championTierData)
      return "("+championTierData.Tier+")";

    return "";
  }

  const populateSummoners = (text) => {
    let lines = text.split("\n");
    let formattedNames = lines.map((line) => {
      return line.replace(" joined the lobby", "");
    })
    setSummoners(formattedNames);
  }

  const dragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const performSwap = (i1, i2) => {
    //debugger
    let val = summoners[i1];
    summoners[i1] = summoners[i2];
    summoners[i2] = val;
    setSummoners([...summoners]);
  }

  // const getSplashArtImageData = () => {
  //   let x = $("#splashArt").x;
  //   let y = $("#splashArt").y;
  //   debugger;
  // }

  const getWinRate = (sd) => {
    //debugger
    if (sd === undefined || sd.wins === "" || sd.losses === "" || (sd.wins === "0" && sd.losses === "0"))
      return "?";
    return ((parseFloat(sd.wins) / (parseFloat(sd.wins) + parseFloat(sd.losses))) * 100).toFixed(2) + "%";
  }

  const getChampionWinRate = (sd, index) => {
    if(sd === undefined)
      return "?"
    let champWinRate = sd.seasonsChampionInfo[0] === undefined ? undefined : sd.seasonsChampionInfo[0].find((champData) => { return champData.champName === selectedChampions[index].label.split("(")[0] });
    if (champWinRate)
      return champWinRate.winRatio;
    return "?";
  }

  const getChampionKda = (sd, index) => {
    if(sd === undefined)
      return "?"
    let champData = sd.seasonsChampionInfo[0] === undefined ? undefined : sd.seasonsChampionInfo[0].find((champData) => { return champData.champName === selectedChampions[index].label.split("(")[0] });
    if (champData)
      return champData.kda.split(":")[0];
    return "?";
  }

  const isAllInfoGiven = () => {
    // console.log("returning: ", summoners.length >= 5 && selectedPlayerChampTop !== "" && selectedOpponentChampTop !== "" && selectedPlayerChampJungle !== "" && selectedOpponentChampJungle !== "" &&
    // selectedPlayerChampMid !== "" && selectedOpponentChampMid !== "" && selectedPlayerChampBot !== "" && selectedOpponentChampBot !== "" &&
    // selectedPlayerChampSup !== "" && selectedOpponentChampSup !== "" && summoners[0] !== "" && summoners[1] !== "" && summoners[2] !== "" && summoners[3] !== "" && summoners[4] !== "")
    let allChampsNotFilled = selectedChampions.find((sc) => { return sc === "" });
    // return summoners.length >= 5 && selectedPlayerChampTop !== "" && selectedOpponentChampTop !== "" && selectedPlayerChampJungle !== "" && selectedOpponentChampJungle !== "" &&
    //   selectedPlayerChampMid !== "" && selectedOpponentChampMid !== "" && selectedPlayerChampBot !== "" && selectedOpponentChampBot !== "" &&
    //   selectedPlayerChampSup !== "" && selectedOpponentChampSup !== "" && summoners[0] !== "" && summoners[1] !== "" && summoners[2] !== "" && summoners[3] !== "" && summoners[4] !== "";
    return summoners.length >= 5 && allChampsNotFilled === undefined && summoners[0] !== "" && summoners[1] !== "" && summoners[2] !== "" && summoners[3] !== "" && summoners[4] !== "";
  }

  const updateSelectedChampion = (index, selection) => {
    selectedChampions[index] = selection;
    setCurrentSelectedChampion(selection.value);
    setSelectedChampions([...selectedChampions])
  }

  const swapChampion = (championIndex) => {
    let copy = selectedChampions[championIndex];
    selectedChampions[championIndex] = selectedChampions[draggedChampionIndex];
    selectedChampions[draggedChampionIndex] = copy;
    setSelectedChampions([...selectedChampions]);
    // setChampFunct(draggedChampion);
    // if(selectedPlayerChampTop.value === draggedChampion)
  }

  const getCellColor = (cutoffs, value) =>
  {
    let colors = ["red", "yellow", "green"]
    if(value === "?")
      return "gray"
    for(let i = 0; i < cutoffs.length; i++)
    {
      if(value < cutoffs[i])
        return colors[i]
    }
  }

  const getTableData = (index) => {
    let jsx = []
    //debugger
    jsx.push(<td>{summoners[index]}</td>);
    let winRate = getWinRate(summonerData[index])
    jsx.push(<td style={{ backgroundColor: getCellColor([45, 55, 100], parseFloat(winRate.replace("%", ""))) }}>{ winRate }</td>)
    jsx.push(<td>{summonerData[index] === undefined ? "?" : summonerData[index].rank}</td>)
    jsx.push(<td>{selectedChampions[index].label.split("(")[0]}</td>)
    let championWinRate = getChampionWinRate(summonerData[index], index)
    jsx.push(<td style={{ backgroundColor: getCellColor([45, 55, 100], parseFloat(championWinRate.replace("%", ""))) }}>{championWinRate}</td>)
    let kda = getChampionKda(summonerData[index], index)
    jsx.push(<td style={{ backgroundColor: getCellColor([2, 3, 100], parseFloat(kda)) }}>{kda}</td>)

    return jsx
  }

  return (
    <div>
      <div style={{ ...styles.center(), color: "yellow", textAlign: "center" }}>
        <h1>Team Draft Checker</h1>
      </div>
      <div style={styles.center()} id="champSelectContainer">
        <div style={{ ...styles.column() }}>
          {/* TOP */}
          <div style={styles.row()}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontWeight: "bold" }}>TOP </label>
            </div>
            <div style={styles.column()}>
              <input type="text" id="topSummoner" style={styles.input()} value={summoners[0]} draggable="true" onDrop={() => performSwap(0, dragIndex)} onDragOver={(e) => dragOver(e)} onDragStart={() => setDragIndex(0)} onChange={(e) => { summoners[0] = e.target.value; setSummoners([...summoners]) }} />
            </div>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "200px" }}>
                <Select
                  id="teamSelectionTop"
                  value={selectedChampions[0]}
                  onChange={(selection) => { updateSelectedChampion(0, selection) }}
                  options={getChampionNames("top", selectedChampions[5])}
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[0].value} draggable="true" onDrop={() => swapChampion(0)} onDragStart={() => { setDraggedChampionIndex(0) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          {/* JUNGLE */}
          <div style={styles.row()}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontWeight: "bold" }}>JUNGLE </label>
            </div>
            <div style={styles.column()}>
              <input type="text" id="jungleSummoner" style={styles.input()} value={summoners[1]} draggable="true" onDrop={() => performSwap(1, dragIndex)} onDragOver={(e) => dragOver(e)} onDragStart={() => setDragIndex(1)} onChange={(e) => { summoners[1] = e.target.value; setSummoners([...summoners]) }} />
            </div>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "200px" }}>
                <Select
                  id="teamSelectionJungle"
                  value={selectedChampions[1]}
                  onChange={(selection) => { updateSelectedChampion(1, selection) }}
                  options={getChampionNames("jungle", selectedChampions[6])}                
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[1].value} draggable="true" onDrop={() => swapChampion(1)} onDragStart={() => { setDraggedChampionIndex(1) }} onDragOver={(e) => dragOver(e)} />
            </div>

          </div>

          {/* MID */}
          <div style={styles.row()}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontWeight: "bold" }}>MID </label>
            </div>
            <div style={styles.column()}>
              <input type="text" id="midSummoner" style={styles.input()} value={summoners[2]} draggable="true" onDrop={() => performSwap(2, dragIndex)} onDragOver={(e) => dragOver(e)} onDragStart={() => setDragIndex(2)} onChange={(e) => { summoners[2] = e.target.value; setSummoners([...summoners]) }} />
            </div>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "200px" }}>
                <Select
                  id="teamSelectionMid"
                  value={selectedChampions[2]}
                  onChange={(selection) => { updateSelectedChampion(2, selection) }}
                  options={getChampionNames("mid", selectedChampions[7])}                
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[2].value} draggable="true" onDrop={() => swapChampion(2)} onDragStart={() => { setDraggedChampionIndex(2) }} onDragOver={(e) => dragOver(e)} />
            </div>

          </div>

          {/* BOT */}
          <div style={styles.row()}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontWeight: "bold" }}>BOT </label>
            </div>
            <div style={styles.column()}>
              <input type="text" id="botSummoner" style={styles.input()} value={summoners[3]} draggable="true" onDrop={() => performSwap(3, dragIndex)} onDragOver={(e) => dragOver(e)} onDragStart={() => setDragIndex(3)} onChange={(e) => { summoners[3] = e.target.value; setSummoners([...summoners]) }} />
            </div>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "200px" }}>
                <Select
                  id="teamSelectionBot"
                  value={selectedChampions[3]}
                  onChange={(selection) => { updateSelectedChampion(3, selection) }}
                  options={getChampionNames("bot", selectedChampions[8])}                 
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[3].value} draggable="true" onDrop={() => swapChampion(3)} onDragStart={() => { setDraggedChampionIndex(3) }} onDragOver={(e) => dragOver(e)} />
            </div>

          </div>

          {/* SUP */}
          <div style={styles.row()}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontWeight: "bold" }}>SUPPORT </label>
            </div>
            <div style={styles.column()}>
              <input type="text" id="supportSummoner" style={styles.input()} value={summoners[4]} draggable="true" onDrop={() => performSwap(4, dragIndex)} onDragOver={(e) => dragOver(e)} onDragStart={() => setDragIndex(4)} onChange={(e) => { summoners[4] = e.target.value; setSummoners([...summoners]) }} />
            </div>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "200px" }}>
                <Select
                  id="teamSelectionSup"
                  value={selectedChampions[4]}
                  onChange={(selection) => { updateSelectedChampion(4, selection) }}
                  options={getChampionNames("support", selectedChampions[9])}      
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[4].value} draggable="true" onDrop={() => swapChampion(4)} onDragStart={() => { setDraggedChampionIndex(4) }} onDragOver={(e) => dragOver(e)} />
            </div>

          </div>

          <textarea id="championSelectInput" placeholder="joined the lobby..." rows="5" style={{ resize: "none", width: "50%", borderRadius: "5px", marginLeft: "101px" }} onChange={(e) => { populateSummoners(e.target.value) }} />
        </div >

        <div style={{ ...styles.column() }}>
          <div style={styles.row()}>
            <SplashArt champion={currentSelectedChampion} />
            <div style={{ textAlign: "center", visibility: (isAllInfoGiven() ? "visible" : "hidden") }}>
              <button className="button" type="button" onClick={getSummonerData}>Calculate</button>
            </div>
          </div>

        </div>

        <div style={{ ...styles.column(), paddingTop: "27px" }}>
          <div style={styles.row()}>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "150px" }}>
                <Select
                  id="opponentSelectionTop"
                  value={selectedChampions[5]}
                  onChange={(selection) => { updateSelectedChampion(5, selection) }}
                  options={getChampionNames()}
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[5].value} draggable="true" onDrop={() => swapChampion(5)} onDragStart={() => { setDraggedChampionIndex(5) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          <div style={styles.row()}>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "150px" }}>
                <Select
                  id="opponentSelectionJungle"
                  value={selectedChampions[6]}
                  onChange={(selection) => { updateSelectedChampion(6, selection) }}
                  options={getChampionNames()}                
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[6].value} draggable="true" onDrop={() => swapChampion(6)} onDragStart={() => { setDraggedChampionIndex(6) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          <div style={styles.row()}>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "150px" }}>
                <Select
                  id="opponentSelectionMid"
                  value={selectedChampions[7]}
                  onChange={(selection) => { updateSelectedChampion(7, selection) }}
                  options={getChampionNames()}                
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[7].value} draggable="true" onDrop={() => swapChampion(7)} onDragStart={() => { setDraggedChampionIndex(7) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          <div style={styles.row()}>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "150px" }}>
                <Select
                  id="opponentSelectionBot"
                  value={selectedChampions[8]}
                  onChange={(selection) => { updateSelectedChampion(8, selection) }}
                  options={getChampionNames()}               
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[8].value} draggable="true" onDrop={() => swapChampion(8)} onDragStart={() => { setDraggedChampionIndex(8) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          <div style={styles.row()}>
            <div style={{ ...styles.column() }}>
              <div style={{ width: "150px" }}>
                <Select
                  id="opponentSelectionSup"
                  value={selectedChampions[9]}
                  onChange={(selection) => { updateSelectedChampion(9, selection) }}
                  options={getChampionNames()}                
                />
              </div>
            </div>
            <div style={styles.column()}>
              <ChampionImage champion={selectedChampions[9].value} draggable="true" onDrop={() => swapChampion(9)} onDragStart={() => { setDraggedChampionIndex(9) }} onDragOver={(e) => dragOver(e)} />
            </div>
          </div>

          <div style={{ visibility: loaderVisible ? "visible" : "hidden" }}>
            <div style={styles.column()}>
              <label style={{ color: "yellow", fontSize: "40px" }}>Loading</label>
            </div>
            <div style={styles.column()}>
              <div className="loader"></div>
            </div>
          </div>
        </div>
      </div>

      {
        summonerData.length !== 0 ?
          <table style={{ width: document.getElementById("champSelectContainer") ? document.getElementById("champSelectContainer").offsetWidth - (document.getElementById("champSelectContainer").offsetWidth / 15) : 0 }}>
            <tr>
              <th></th>
              <th>Summoner Name</th>
              <th>Win Rate</th>
              <th>Rank</th>
              <th>Playing</th>
              <th>Champion Win Rate</th>
              <th>KDA</th>
            </tr>
            <tr>
              <th>Top</th>
              {getTableData(0)}
            </tr>
            <tr>
              <th>Jungle</th>
              {getTableData(1)}
            </tr>
            <tr>
              <th>Mid</th>
              {getTableData(2)}
            </tr>
            <tr>
              <th>Bot</th>
              {getTableData(3)}
            </tr>
            <tr>
              <th>Support</th>
              {getTableData(4)}
            </tr>
          </table>
          :
          <></>
      }
    </div>

  );
}

export default App;
