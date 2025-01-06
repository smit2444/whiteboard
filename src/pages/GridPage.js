import React, { useState, useRef } from "react";
import { GoPlus, GoDash } from "react-icons/go";
import { CiLinkedin, CiLink } from "react-icons/ci";
import Logo from "../assets/WhiteBoard.png";
import FileUploadContainer from "../components/FileUpload";

const GridPage = () => {
  const [rows, setRows] = useState([
    { id: 1, height: 50, panels: [{ id: 1, width: 50, file: null }, { id: 2, width: 50, file: null }] },
    { id: 2, height: 50, panels: [{ id: 1, width: 50, file: null }, { id: 2, width: 50, file: null }] },
  ]);
  const containerRef = useRef(null);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const resizingPanelIndex = useRef({ row: null, panel: null });
  const resizingRowIndex = useRef(null);

  const resetLayout = () => {
    setRows((prevRows) => {
      const resetRows = prevRows.map((row) => ({
        ...row,
        height: 100 / prevRows.length, 
        panels: row.panels.map((panel) => ({
          ...panel,
          width: 100 / row.panels.length, 
        })),
      }));
      return resetRows;
    });
  };

  const handlePanelMouseMove = (e) => {
    const { row, panel } = resizingPanelIndex.current;
    if (row === null || panel === null) return;

    const containerWidth = containerRef.current.offsetWidth;
    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const currentRow = updatedRows[row];
      const currentPanel = currentRow.panels[panel];
      const nextPanel = currentRow.panels[panel + 1];

      if (!nextPanel) return prevRows;

      const newCurrentWidth = currentPanel.width + (deltaX / containerWidth) * 100;
      const newNextWidth = nextPanel.width - (deltaX / containerWidth) * 100;

      if (newCurrentWidth >= 10 && newNextWidth >= 10) {
        currentPanel.width = newCurrentWidth;
        nextPanel.width = newNextWidth;
      }

      return updatedRows;
    });
  };

  const handlePanelMouseDown = (e, rowIndex, panelIndex) => {
    resizingPanelIndex.current = { row: rowIndex, panel: panelIndex };
    lastMouseX.current = e.clientX;
    e.preventDefault();
  };

  const handleRowMouseMove = (e) => {
    const rowIndex = resizingRowIndex.current;
    if (rowIndex === null) return;

    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.clientY - lastMouseY.current;
    lastMouseY.current = e.clientY;

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const currentRow = updatedRows[rowIndex];
      const nextRow = updatedRows[rowIndex + 1];

      if (!nextRow) return prevRows;

      const newCurrentHeight = currentRow.height + (deltaY / containerHeight) * 100;
      const newNextHeight = nextRow.height - (deltaY / containerHeight) * 100;

      if (newCurrentHeight >= 10 && newNextHeight >= 10) {
        currentRow.height = newCurrentHeight;
        nextRow.height = newNextHeight;
      }

      return updatedRows;
    });
  };

  const handleRowMouseDown = (e, rowIndex) => {
    resizingRowIndex.current = rowIndex;
    lastMouseY.current = e.clientY;
    e.preventDefault();
  };

  const handleMouseUp = () => {
    resizingPanelIndex.current = { row: null, panel: null };
    resizingRowIndex.current = null;
  };

  const ControlButton = ({ onClick, disabled, icon: Icon, className = "", tooltipText = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltipText}
      className={`relative p-0.5 rounded-full bg-white shadow-sm 
        hover:shadow-md hover:scale-110 transition-all duration-200 z-10
        disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      <Icon className="w-3 h-3" />
    </button>
  );

  const addColumnAt = (rowIndex, position) => {
    setRows(prevRows => {
      if (prevRows[rowIndex].panels.length >= 3) return prevRows;

      const updatedRows = [...prevRows];
      const currentRow = { ...updatedRows[rowIndex] };
      const newWidth = 100 / (currentRow.panels.length + 1);
      const newPanel = { id: Date.now(), width: newWidth, file: null };

      currentRow.panels = position === 'left'
        ? [newPanel, ...currentRow.panels]
        : [...currentRow.panels, newPanel];

      currentRow.panels = currentRow.panels.map(panel => ({
        ...panel,
        width: 100 / currentRow.panels.length
      }));

      updatedRows[rowIndex] = currentRow;
      return updatedRows;
    });
  };

  const addRowAt = (rowIndex, position) => {
    setRows(prevRows => {
      if (prevRows.length >= 3) return prevRows;

      const newRow = {
        id: Date.now(),
        height: 100 / (prevRows.length + 1),
        panels: [
          { id: Date.now(), width: 50, file: null },
          { id: Date.now() + 1, width: 50, file: null }
        ]
      };

      const updatedRows = position === 'top'
        ? [...prevRows.slice(0, rowIndex), newRow, ...prevRows.slice(rowIndex)]
        : [...prevRows.slice(0, rowIndex + 1), newRow, ...prevRows.slice(rowIndex + 1)];

      return updatedRows.map(row => ({
        ...row,
        height: 100 / updatedRows.length
      }));
    });
  };

  const removeColumn = (rowIndex, panelIndex) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      const currentRow = { ...updatedRows[rowIndex] };

      if (currentRow.panels.length <= 1) return prevRows;

      currentRow.panels = currentRow.panels
        .filter((_, index) => index !== panelIndex)
        .map(panel => ({
          ...panel,
          width: 100 / (currentRow.panels.length - 1)
        }));

      updatedRows[rowIndex] = currentRow;
      return updatedRows;
    });
  };

  const removeRow = (rowIndex) => {
    setRows(prevRows => {
      if (prevRows.length <= 1) return prevRows;

      const updatedRows = prevRows.filter((_, index) => index !== rowIndex);
      return updatedRows.map(row => ({
        ...row,
        height: 100 / updatedRows.length
      }));
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-gray-100 p-2"
      onMouseMove={(e) => {
        handlePanelMouseMove(e);
        handleRowMouseMove(e);
      }}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-gray-100 flex h-9">
        <div className="flex items-center space-x-3 text-sm text-gray-700  flex-1 justify-start">
          <div className="border p-1 mb-3 rounded-lg flex items-center">
            <span>Project By: Smit</span>
            <a href="https://www.linkedin.com/in/smit09/" className="group relative ml-2 text-black hover:text-grya-600">
              <CiLinkedin size={25} className="group-hover:text-gray-600 transition-colors" />
            </a>
            <a href="http://smit2444.github.io/portfolio/" className="text-black hover:text-gray-600 hover:border-gray-600 border border-black rounded-full">
              <CiLink size={18} />
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center h-full">
          <img src={Logo} alt="WhiteBoard" style={{ width: 'auto', height: 'auto'}} />
        </div>

        <div className="flex items-center space-x-2 flex-1 justify-end">
          <button
            className="bg-black text-white px-2 rounded text-xs h-5"
            onClick={resetLayout}
          >
            Reset Layout
          </button>
        </div>
      </div>


      <div className="flex-grow rounded-lg overflow-hidden shadow-sm relative">
        {rows.map((row, rowIndex) => (
          <div
            key={row.id}
            className="relative flex flex-row border-b border-gray-200 last:border-b-0 group"
            style={{ height: `${row.height}%` }}
          >
            {row.panels.map((panel, panelIndex) => (
              <div
                key={panel.id}
                className="relative bg-gray-200 group/panel"
                style={{ width: `${panel.width}%` }}
              >
                <div className="p-3 h-full">
                  <div className="p-3 h-full bg-white">
                  <FileUploadContainer
                    file={panel.file}
                    setFile={(file) => {
                      const updatedRows = [...rows];
                      updatedRows[rowIndex].panels[panelIndex].file = file;
                      setRows(updatedRows);
                    }}
                  />
                  </div>
                </div>

                {panelIndex < row.panels.length - 1 && (
                  <div className="absolute inset-y-0 right-0 flex items-center z-20">
                    <div
                      className="w-1 h-full bg-gray-200 cursor-col-resize hover:bg-gray-900 transition-colors group-hover/panel:w-1.5"
                      onMouseDown={(e) => handlePanelMouseDown(e, rowIndex, panelIndex)}
                    />
                  </div>
                )}

                <div className="absolute top-1/2 -translate-y-1/2 p-1 right-1 flex flex-col gap-2 opacity-0 group-hover/panel:opacity-100 transition-all duration-200 z-10 bg-gray-200"
                  style={{
                    borderRadius: '8px',
                  }}>
                  <ControlButton
                    onClick={() => addColumnAt(rowIndex, 'right')}
                    disabled={row.panels.length >= 3}
                    icon={GoPlus}
                    tooltipText="Add Panel"
                    className="bg-blue-50 hover:bg-blue-100"
                  />
                  <ControlButton
                    onClick={() => removeColumn(rowIndex, panelIndex)}
                    disabled={row.panels.length <= 1}
                    icon={GoDash}
                    tooltipText="Remove Panel"
                    className="bg-red-50 hover:bg-red-100"
                  />
                </div>
                <div className="absolute bottom-0 left-0 w-full px-2 py-1 flex justify-center gap-2 opacity-0 group-hover/panel:opacity-100 transition-all duration-200 z-20"
                >
                  <div className="relative flex flex-row gap-2 bg-gray-200 p-1"
                    style={{
                      borderRadius: '8px'
                    }}
                  >
                    <ControlButton
                      onClick={() => removeRow(rowIndex)}
                      disabled={rows.length <= 1}
                      icon={GoDash}
                      tooltipText="Remove Panel Row"
                      className="bg-red-50 hover:bg-red-100"
                    />
                    <ControlButton
                      onClick={() => addRowAt(rowIndex, 'bottom')}
                      disabled={rows.length >= 3}
                      icon={GoPlus}
                      tooltipText="Add Panel Row"
                      className="bg-blue-50 hover:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            {rowIndex < rows.length - 1 && (
              <div
                className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 cursor-row-resize 
                hover:bg-gray-900 transition-colors group-hover:h-1.5 z-30"
                onMouseDown={(e) => handleRowMouseDown(e, rowIndex)}
              />
            )}
          </div>

        ))}
      </div>
    </div>
  );
};

export default GridPage;