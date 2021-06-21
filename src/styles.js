export const center = () => {
    return {
        display: "table",
        marginLeft: "auto",
        marginRight: "auto",
        width: "30%"

        // display: "table",
        // tableLayout: "fixed",
        // /* position: absolute; */
        // marginLeft: "auto",
        // marginRight: "auto",
        // width: "50%"
    }
}


export const row = () => {
    return {
        display: "table-row",
    }
}

export const column = () => {
    return {
        //flex: "50%",
        padding: "10px",
        verticalAlign: "middle",
        display: "table-cell"
    }
}

export const input = () => {
    return {
        width: "150px",
        height: "35px",
        borderRadius: "5px",
        border: "0px"
    }
}
