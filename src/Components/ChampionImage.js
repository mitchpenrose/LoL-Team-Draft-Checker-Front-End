import React, { useState, useEffect } from "react";
import * as appState from '../Utils/AppState.js';
//import { saveComment } from '../../services/services.js';

const ChampionImage = (props) => {

    const [selectedChampion, setSelectedChampion] = useState("");

    useEffect(() => {
        setSelectedChampion(props.champion);
      }, [props.champion]);

    return (
        <>
            <img src={selectedChampion === undefined ? require('./placeholder.png').default : "http://ddragon.leagueoflegends.com/cdn/"+appState.getCurrentVersion()+"/img/champion/"+selectedChampion+".png"} alt={selectedChampion} style={{borderRadius: "50%"}} draggable={props.draggable} onDrop={props.onDrop} onDragOver={props.onDragOver} onDragStart={props.onDragStart} onDragOver={props.onDragOver}></img>
        </>
    )
}

export default ChampionImage;