import { ColDef } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SimpleComponent = (p: any) => {
  console.log("p", p);

  return (
    <div>
      <button>{p.buttonText}</button>
      <span>{p.value}</span>
    </div>
  );
};

const CountComponent = (p: any) => {
  const renderCountRef = useRef(1);
  return (
    <>
      <b>({renderCountRef.current++})</b> {p.value}
    </>
  );
};

function App() {
  const gridRef = useRef<AgGridReact>(undefined!);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "athlete",
      cellRenderer: SimpleComponent,
      cellRendererParams: {
        buttonText: "okokok",
      },
    },
    { field: "age", cellRenderer: (p: any) => <b>{p.value}</b> },
    { field: "country" },
    {
      field: "year",
      cellRendererSelector: (p: any) => {
        if (p.value === 2000) {
          return {
            component: SimpleComponent,
            params: {
              buttonText: "age-ok",
            },
          };
        }

        if (p.value === 2004) {
          return {
            component: SimpleComponent,
            params: {
              buttonText: "age-ng",
            },
          };
        }
      },
    },
    { field: "date", cellRenderer: CountComponent },
    { field: "sport", cellRenderer: CountComponent },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" },
  ]);
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
    }),
    []
  );

  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((result) => result.json())
      .then((rowData1) => {
        setRowData(rowData1);
      });
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ width: "100%", height: 800 }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        animateRows={true}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
}

export default App;
