import React, { useState } from "react";
import Cell from "./Cell";
import spreadsheetEval from "../Lib/spreadsheetEval";
import columnIdToHeader from "../Lib/columnIdToHeader";
import "./Sheet.css";

const Sheet = (props) => {
    const { numCols, numRows } = props;
    const [cells, setCells] = useState({});

    const setCellInput = (cellId) => {
        return (input) => {
            setCells((cells) => spreadsheetEval(cellId, input, { ...cells }));
        };
    };

    const getColHeaders = () => {
        const headers = [<td key="apexHeader" className="Cell Cell--apex-header"></td>];
        for (let col = 0; col < numCols; col += 1) {
            headers.push(
                <td key={`${col},header`} className="Cell Cell--col-header">
                    {columnIdToHeader(col)}
                </td>
            );
        }
        return <tr key="col-headers">{headers}</tr>;
    };

    const getRowHeader = (row) => {
        return (
            <td key={`header,${row}`} className="Cell Cell--row-header">
                {row + 1}
            </td>
        );
    };

    const getCells = () => {
        const rows = [];
        for (let row = 0; row < numRows; row += 1) {
            const rowCells = [getRowHeader(row)];
            for (let col = 0; col < numCols; col += 1) {
                const key = `${col},${row}`;
                if (!cells[key]) {
                    cells[key] = { value: "", input: "" };
                }
                rowCells.push(
                    <Cell
                        key={key}
                        input={cells[key].input}
                        value={cells[key].value}
                        setInput={setCellInput(key)}
                    />
                );
            }
            rows.push(<tr key={row}>{rowCells}</tr>);
        }
        return rows;
    };

    return (
        <table className="Sheet">
            <thead>{getColHeaders()}</thead>
            <tbody>{getCells()}</tbody>
        </table>
    );
};

export default Sheet;
