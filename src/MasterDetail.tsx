import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import "ag-grid-enterprise";
import { GridOptions } from "ag-grid-community";
// this is a hook, but we work also with classes
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

function GridExample() {
  const [rowData, setRowData] = useState(null);

  const gridRef = useRef<AgGridReact>(null!);

  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/master-detail-data.json")
      .then((resp) => resp.json())
      .then((data) => {
        setRowData(data);
        setTimeout(
          () => gridRef.current.api.getDisplayedRowAtIndex(1).setExpanded(true),
          100
        );
      });
  }, []);

  const columnDefs = useMemo(
    () => [
      { field: "name", cellRenderer: "agGroupCellRenderer" },
      { field: "account", cellRendererFramework: MyRenderer },
      { field: "calls" },
      { field: "minutes", valueFormatter: "x.toLocaleString() + 'm'" },
    ],
    []
  );

  const detailGridOptions = useMemo<GridOptions>(
    () => ({
      rowSelection: "multiple",
      suppressRowClickSelection: true,
      enableRangeSelection: true,
      pagination: true,
      paginationAutoPageSize: true,
      columnDefs: [
        {
          field: "callId",
          checkboxSelection: true,
        },
        {
          field: "direction",
          cellRendererFramework: MyRenderer,
        },
        {
          field: "number",
          minWidth: 150,
        },
        {
          field: "duration",
          valueFormatter: "x.toLocaleString() + 's'",
        },
        {
          field: "switchCode",
          minWidth: 150,
        },
      ],
      defaultColDef: {
        sortable: true,
        flex: 1,
      },
    }),
    []
  );

  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: detailGridOptions,
      getDetailRowData: (params: any) =>
        params.successCallback(params.data.callRecords),
    }),
    []
  );

  return (
    <div
      className="ag-theme-alpine"
      style={{
        width: "100%",
        height: 800,
      }}
    >
      <AgGridReact
        reactUi={true}
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={{ flex: 1 }}
        // masterDetail={true}
        // detailCellRendererParams={detailCellRendererParams}
        rowData={rowData}
      />
    </div>
  );
}

export default GridExample;
