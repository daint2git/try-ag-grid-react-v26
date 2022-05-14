import {
  CellValueChangedEvent,
  ColDef,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  ComponentStateChangedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  IHeaderGroupParams,
  IHeaderParams,
  PasteEndEvent,
  PasteStartEvent,
  RowValueChangedEvent,
  StatusPanelDef,
  ToolPanelVisibleChangedEvent,
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
import "./AllCustomisations.css";
import "ag-grid-enterprise";

class MyJavaScriptEditor {
  private gui: any;
  init(props: any) {
    this.gui = document.createElement("input");
    this.gui.type = "number";
    this.gui.className = "my-editor";
    this.gui.value = props.value;
    this.gui.addEventListener("keydown", (event: any) => {
      if (event.keyCode == 13) {
        props.stopEditing();
      }
    });
  }
  afterGuiAttached() {
    this.gui.focus();
  }
  getGui() {
    return this.gui;
  }
  getValue() {
    return this.gui.value;
  }
}

const MyReactEditor = memo(
  forwardRef<any, ICellEditorParams>((props, ref) => {
    const [value, setValue] = useState(parseInt(props.value));
    const refInput = useRef<HTMLInputElement>(null!);

    // Cell Editor interface, that the grid calls
    useImperativeHandle(ref, () => {
      return {
        // the final value to send to the grid, on completion of editing
        getValue() {
          // this simple editor doubles any value entered into the input
          return value;
        },
      };
    });

    const onChangeListener = useCallback(
      (event: any) => setValue(event.target.value),
      []
    );
    const onKeyDownListener = useCallback((event) => {
      if (event.keyCode == 13) {
        props.stopEditing();
      }
    }, []);

    useEffect(() => refInput.current.focus(), []);

    return (
      <input
        type="number"
        className="my-editor"
        ref={refInput}
        value={value}
        onChange={onChangeListener}
        onKeyDown={onKeyDownListener}
      />
    );
  })
);

const SortingHeader = memo((props: IHeaderParams) => {
  const [sortState, setSortState] = useState<"ASC" | "DESC" | undefined>();

  // console.log("", props);

  const handleClick = useCallback(() => {
    props.progressSort();
  }, []);

  useEffect(() => {
    const listener = () => {
      if (props.column.isSortAscending()) {
        setSortState("ASC");
        return;
      }

      if (props.column.isSortDescending()) {
        setSortState("DESC");
        return;
      }

      setSortState(undefined);
    };

    props.column.addEventListener("sortChanged", listener);

    return () => {
      props.column.removeEventListener("sortChanged", listener);
    };
  }, []);

  return (
    <span className="my-header" onClick={handleClick}>
      <img
        src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif"
        className="my-spinner"
      />
      {props.displayName} {sortState}
    </span>
  );
});

const GroupHeader = memo((props: IHeaderGroupParams) => {
  const { columnGroup } = props;
  const [expanded, setExpanded] = useState(columnGroup.isExpanded());
  const expandable = columnGroup.isExpandable();
  const originalColumnGroup = columnGroup.getOriginalColumnGroup();

  const handleExpandClicked = () => {
    props.setExpanded(!columnGroup.isExpanded());
  };

  useEffect(() => {
    const listener = () => {
      setExpanded(columnGroup.isExpanded());
    };

    originalColumnGroup.addEventListener("expandedChanged", listener);

    return () => {
      originalColumnGroup.removeEventListener("expandedChanged", listener);
    };
  }, []);

  return (
    <span className="my-group-header">
      <img
        src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif"
        className="my-spinner"
      />
      {props.displayName}
      {expandable && (
        <button
          type="button"
          onClick={handleExpandClicked}
          className="my-expand"
        >
          {expanded ? "<" : ">"}
        </button>
      )}
    </span>
  );
});

const MyStatusPanel = forwardRef((props, ref) => {
  const [value, setValue] = useState(0);

  console.log("render MyStatusPanel");

  useImperativeHandle(ref, () => {
    return {
      sampleStatusPanelMethod() {
        setValue((value) => value + 1);
      },
    };
  });

  return (
    <div className="my-status-panel">
      <span>Sample Status Panel</span>
      <span className="my-status-panel-value">{value}</span>
    </div>
  );
});

const MyToolPanel = forwardRef((props, ref) => {
  console.log("render MyToolPanel");

  const [value, setValue] = useState(0);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      sampleToolPanelMethod() {
        setValue((value) => value + 1);
      },
    };
  });

  return (
    <div className="my-tool-panel">
      <div>Sample Tool Panel</div>
      <div className="my-tool-panel-value">{value}</div>
    </div>
  );
});

const MyLoadingOverlay = () => {
  return (
    <div className="my-loading-overlay">
      <img
        src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif"
        className="my-spinner"
      />
      Loading...
    </div>
  );
};

function GridExample() {
  const [gridApi, setGridApi] = useState<GridApi>();
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Group A",
        headerGroupComponentFramework: GroupHeader,
        children: [
          { field: "country" },
          { field: "athlete", headerComponentFramework: SortingHeader },
        ],
      },
      {
        headerName: "Group B",
        headerGroupComponentFramework: GroupHeader,
        children: [
          {
            headerName: "JS inline",
            field: "gold",
            editable: true,
            cellEditor: MyJavaScriptEditor,
          },
          {
            field: "silver",
            headerName: "JS Popup",
            cellEditor: MyJavaScriptEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: "under",
          },
          {
            headerName: "React Inline",
            field: "bronze",
            editable: true,
            cellEditorFramework: MyReactEditor,
          },
          {
            field: "total",
            headerName: "React Popup",
            cellEditorFramework: MyReactEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: "under",
            columnGroupShow: "open",
          },
        ],
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      editable: true,
      sortable: true,
      filter: true,
      flex: 1,
    }),
    []
  );

  const statusBar = useMemo<GridOptions["statusBar"]>(
    () => ({
      statusPanels: [
        // {
        //   statusPanel: "myStatusPanel",
        // },
        // {
        //   statusPanel: "agTotalRowCountComponent",
        //   align: "right",
        // },
        // {
        //   statusPanel: "agSelectedRowCountComponent",
        //   align: "center",
        // },
        // {
        //   statusPanel: "agAggregationComponent",
        //   align: "left",
        // },
      ],
    }),
    []
  );

  const sideBar = useMemo<GridOptions["sideBar"]>(
    () => ({
      toolPanels: [
        "columns",
        "filters",
        {
          id: "myToolPanel",
          labelDefault: "My Tool Panel",
          labelKey: "myToolPanel",
          iconKey: "filter",
          toolPanelFramework: MyToolPanel,
        },
      ],
      defaultToolPanel: "myToolPanel",
    }),
    []
  );

  const frameworkComponents = useMemo(
    () => ({
      // myStatusPanel: MyStatusPanel,
    }),
    []
  );

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((resp) => resp.json())
      .then((data) => setRowData(data));
  }, []);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
    },
    [gridApi]
  );

  const onBtShowLoading = () => {
    gridApi?.showLoadingOverlay();
  };

  const onBtHideOverlay = () => {
    gridApi?.hideOverlay();
  };

  const onToolPanelVisibleChanged = useCallback(
    (event: ToolPanelVisibleChangedEvent) => {
      // console.log(
      //   "🚀 ~ file: AllCustomisations.tsx ~ line 365 ~ GridExample ~ event",
      //   event
      // );
    },
    []
  );

  const context = useMemo<GridOptions["context"]>(
    () => ({
      myContext1: "ok",
      myContext2: true,
    }),
    []
  );

  const onPasteStart = useCallback((event: PasteStartEvent) => {
    console.log("🚀 GridExample ~ event", event);
  }, []);

  const onPasteEnd = useCallback((event: PasteEndEvent) => {
    console.log("🚀 GridExample ~ event", event);
  }, []);

  const onColumnVisible = useCallback((event: ColumnVisibleEvent) => {
    console.log("🚀 GridExample ~ event", event);
  }, []);

  const onColumnResized = useCallback((event: ColumnResizedEvent) => {
    console.log("🚀 GridExample ~ event", event);
  }, []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log("🚀 onCellValueChanged ~ event", event);
  }, []);

  const onRowValueChanged = useCallback((event: RowValueChangedEvent) => {
    console.log("🚀 onRowValueChanged ~ event", event);
  }, []);

  const onComponentStateChanged = useCallback(
    (event: ComponentStateChangedEvent) => {
      console.log("🚀 onComponentStateChanged ~ event", event);
    },
    []
  );

  return (
    <div className="top-level">
      <div className="buttons-bar">
        <div>
          <button onClick={onBtShowLoading}>Show Loading Overlay</button>
          <button onClick={onBtHideOverlay}>Hide Overlay</button>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          width: "100%",
          height: 800,
        }}
      >
        <AgGridReact
          // turn on AG Grid React UI
          reactUi={true}
          // all other properties as normal...
          className="ag-theme-alpine"
          animateRows={true}
          // statusBar={statusBar}
          sideBar={sideBar}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          onGridReady={onGridReady}
          rowSelection="multiple"
          frameworkComponents={frameworkComponents}
          loadingOverlayComponentFramework={MyLoadingOverlay}
          onToolPanelVisibleChanged={onToolPanelVisibleChanged}
          onPasteStart={onPasteStart}
          onPasteEnd={onPasteEnd}
          onColumnVisible={onColumnVisible}
          onColumnResized={onColumnResized}
          onCellValueChanged={onCellValueChanged}
          onRowValueChanged={onRowValueChanged}
          context={context}
          onComponentStateChanged={onComponentStateChanged}
        />
      </div>
    </div>
  );
}

export default GridExample;
