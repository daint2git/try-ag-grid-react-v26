import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "ag-grid-enterprise";

const data = Array.from({ length: 40 }, (v, i) => ({
  id: i,
  athlete: "athlete" + i,
  age: i,
  country: "country" + i,
  year: 2020,
  date: "01/01/20202",
}));

function App() {
  const gridRef = useRef<AgGridReact>(null!);
  const tempRowDataRef = useRef<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "athlete",
      filter: "agTextColumnFilter",
      filterParams: {
        debounceMs: 0,
        buttons: ["apply", "clear", "cancel", "reset"],
      },
    },
    {
      field: "age",
      filter: "agNumberColumnFilter",
      filterParams: {
        debounceMs: 1000,
      },
    },
    { field: "country" },
    { field: "year" },
    {
      field: "date",
      filter: "agDateColumnFilter",
    },
  ]);
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      flex: 1,
    }),
    []
  );

  const savedFilterState = useRef<Record<string, any>>();

  const handleButtonSave = () => {
    const filterModel = gridApi?.getFilterModel();
    console.log("Saving filter model", filterModel);
    savedFilterState.current = filterModel;
  };

  const handleButtonApply = () => {
    const filterModel = savedFilterState.current;
    console.log("Applying filter model", filterModel);
    gridApi?.setFilterModel(filterModel);
  };

  useEffect(() => {
    // fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    //   .then((result) => result.json())
    //   .then((rowData1) => {
    //     tempRowDataRef.current = rowData1;
    //     // setRowData(rowData1);
    //     gridApi?.setRowData(tempRowDataRef.current);
    //   });

    tempRowDataRef.current = data;
    gridApi?.setRowData(data);
  }, [gridApi]);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
    },
    [gridApi]
  );

  const handleGetSelectedRows = () => {
    // console.log("gridRef.current.api", gridRef.current.api);
    // console.log("gridApi", gridApi);
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node: any) => node.data);
    console.log(selectedData);
  };

  return (
    <div>
      <div>
        <button onClick={handleButtonSave}>Save</button>
        <button onClick={handleButtonApply}>Apply</button>
        <button onClick={handleGetSelectedRows}>Get selected rows</button>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          width: "100%",
          height: 800,
        }}
      >
        <AgGridReact
          ref={gridRef}
          onGridReady={onGridReady}
          // rowData={[]}
          animateRows={true}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          // getRowNodeId={(data) => {
          //   return data.id;
          // }}
          // immutableData={true}
        />
      </div>
    </div>
  );
}

export default App;
