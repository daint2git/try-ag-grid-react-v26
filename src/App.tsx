import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
// import { LicenseManager } from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("DUMMY");
import "ag-grid-enterprise";
import "./App.scss";

function MyRenderer(params: any) {
  return (
    <span className="my-renderer">
      <img
        src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif"
        className="my-spinner"
      />
      {params.value}
    </span>
  );
}

function App() {
  const gridRef = useRef<AgGridReact>(undefined!);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "sport",
      // enableRowGroup: true,
      // hide: true,
      // rowGroup: true,
      cellRendererFramework: MyRenderer,
    },
    { field: "country", rowGroup: true, hide: true },
    {
      field: "athlete",
      cellRendererParams: {
        suppressCount: true,
        checkbox: true,
      },
      width: 300,
    },
    {
      field: "gold",
      aggFunc: "sum",
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams: {
        checkbox: true,
      },
      enableRowGroup: false,
    },
    { field: "silver" },
    { field: "bronze", aggFunc: "sum" },
    { field: "total", aggFunc: "sum" },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      // enableRowGroup: true,
    }),
    []
  );

  const handleCellClicked = useCallback((e: any) => {
    console.log("cellClicked", e);
  }, []);

  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((response) => response.json())
      .then((result) => setRowData(result));
  }, []);

  const handleDeselectAll = useCallback((e: any) => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 500 }}>
      <button onClick={handleDeselectAll}>deselect all</button>
      <AgGridReact
        reactUi
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        enableRangeSelection
        animateRows={true}
        rowGroupPanelShow="always"
        onCellClicked={handleCellClicked}
        suppressRowClickSelection
      />
    </div>
  );
}

export default App;
