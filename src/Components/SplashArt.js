import React, { useState, useEffect } from "react";
import * as appState from '../Utils/AppState.js';

const ChampionImage = (props) => {

    const [selectedChampion, setSelectedChampion] = useState("");

    const crop = {
        unit: 'px', // default, can be 'px' or '%'
        x: 0,
        y: 0,
        width: 200,
        height: 200
    }

    useEffect(() => {
        setSelectedChampion(props.champion);
      }, [props.champion]);

    return (
        <>
            <img id="splashArt" width="717" height="717" draggable="false" src={selectedChampion === undefined ? require('./placeholder.png').default : "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + selectedChampion + "_0.jpg"} alt={selectedChampion} style={{borderRadius: "50%"}}></img>
        </>
    )
}

export default ChampionImage;