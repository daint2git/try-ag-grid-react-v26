import {
  CheckboxSelectionCallback,
  ColDef,
  GridApi,
  GridReadyEvent,
  HeaderCheckboxSelectionCallback,
  ICellEditorParams,
  IHeaderGroupParams,
  IHeaderParams,
  PaginationChangedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "./Pagination.css";
import "ag-grid-enterprise";

const checkboxSelection: CheckboxSelectionCallback = (params) => {
  return params.columnApi.getRowGroupColumns().length === 0;
};
const headerCheckboxSelection: HeaderCheckboxSelectionCallback = (params) => {
  return params.columnApi.getRowGroupColumns().length === 0;
};

function GridExample() {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "athlete",
        checkboxSelection,
        headerCheckboxSelection,
        minWidth: 170,
      },
      {
        field: "country",
        enableRowGroup: true,
        filter: true,
      },
      {
        field: "gold",
        editable: true,
      },
      {
        field: "silver",
        cellEditorPopup: true,
        cellEditorPopupPosition: "under",
      },
      {
        field: "bronze",
        editable: true,
      },
      {
        field: "total",
        cellEditorPopup: true,
        cellEditorPopupPosition: "under",
        columnGroupShow: "open",
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      // flex: 1,
    }),
    []
  );
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  useEffect(() => {
    if (gridApi) {
      fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
        .then((resp) => resp.json())
        .then((data) => {
          gridApi?.setRowData(data);
        });
    }
  }, [gridApi]);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
    },
    [gridApi]
  );

  const onPageSizeChanged = (nextPageSize: number) => {
    gridApi?.paginationSetPageSize(nextPageSize);
  };

  const onBtFirst = () => {
    gridApi?.paginationGoToFirstPage();
  };

  const onBtLast = () => {
    gridApi?.paginationGoToLastPage();
  };

  const onBtNext = () => {
    gridApi?.paginationGoToNextPage();
  };

  const onBtPrevious = () => {
    gridApi?.paginationGoToPreviousPage();
  };

  const onBtPageFive = () => {
    gridApi?.paginationGoToPage(4);
  };

  const onBtPageFifty = () => {
    gridApi?.paginationGoToPage(49);
  };

  const onPaginationChanged = (params: PaginationChangedEvent) => {
    console.log("onPaginationChanged", params);
    const { api } = params;

    if (api) {
      setText("#lbLastPageFound", api.paginationIsLastPageFound());
      setText("#lbPageSize", api.paginationGetPageSize());
      setText("#lbCurrentPage", api.paginationGetCurrentPage() + 1);
      setText("#lbTotalPages", api.paginationGetTotalPages());

      setLastButtonDisabled(
        api.paginationGetCurrentPage() + 1 === api.paginationGetTotalPages()
      );
    }
  };

  return (
    <div>
      <div>
        Page Size:
        <select
          onChange={(e) => onPageSizeChanged(Number(e.target.value))}
          defaultValue={30}
        >
          <option value="10">10</option>
          <option value="30">30</option>
          <option value="100">100</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
      </div>
      <div className="example-header">
        <div>
          <button onClick={() => onBtFirst()}>To First</button>
          <button onClick={() => onBtLast()} id="btLast">
            To Last
          </button>
          <button onClick={() => onBtPrevious()}>To Previous</button>
          <button onClick={() => onBtNext()}>To Next</button>
          <button onClick={() => onBtPageFive()}>To Page 5</button>
          <button onClick={() => onBtPageFifty()}>To Page 50</button>
        </div>

        <div style={{ marginTop: "6px" }}>
          <span className="label">Last Page Found:</span>
          <span className="value" id="lbLastPageFound">
            -
          </span>
          <span className="label">Page Size:</span>
          <span className="value" id="lbPageSize">
            -
          </span>
          <span className="label">Total Pages:</span>
          <span className="value" id="lbTotalPages">
            -
          </span>
          <span className="label">Current Page:</span>
          <span className="value" id="lbCurrentPage">
            -
          </span>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          width: 800,
          height: 800,
        }}
      >
        <AgGridReact
          // turn on AG Grid React UI
          reactUi={true}
          // all other properties as normal...
          animateRows={true}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={true}
          rowGroupPanelShow="always"
          rowSelection={"multiple"}
          enableRangeSelection={true}
          // paginationAutoPageSize={true}
          paginationPageSize={30}
          paginationNumberFormatter={function (params) {
            return "[" + params.value.toLocaleString() + "]";
          }}
          suppressPaginationPanel={true}
          suppressScrollOnNewData={true}
          onPaginationChanged={onPaginationChanged}
        />
      </div>
    </div>
  );
}

export default GridExample;

function setText(selector: string, text: number | boolean) {
  document.querySelector(selector)!.innerHTML = "" + text;
}
function setLastButtonDisabled(disabled: boolean) {
  (document.querySelector("#btLast") as HTMLButtonElement)!.disabled = disabled;
}
