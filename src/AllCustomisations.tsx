import {
  BodyScrollEndEvent,
  CellEditingStartedEvent,
  CellEditingStoppedEvent,
  CellKeyDownEvent,
  CellKeyPressEvent,
  CellValueChangedEvent,
  ColDef,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  ComponentStateChangedEvent,
  FilterOpenedEvent,
  FirstDataRenderedEvent,
  GetContextMenuItemsParams,
  GetMainMenuItemsParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellEditorParams,
  IHeaderGroupParams,
  IHeaderParams,
  MenuItemDef,
  PasteEndEvent,
  PasteStartEvent,
  RowDataChangedEvent,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
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
  useReducer,
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

const SortingHeader = memo((props: IHeaderParams & { menuIcon: string }) => {
  console.log("SortingHeader", props);

  const [sortState, setSortState] = useState<"ASC" | "DESC" | undefined>();
  const refButton = useRef<HTMLDivElement>(null!);
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

  const onMenuClicked = () => {
    props.showColumnMenu(refButton.current);
  };

  let menu = null;
  console.log("props.enableMenu", props.enableMenu);

  if (props.enableMenu) {
    menu = (
      <span
        ref={refButton}
        className="customHeaderMenuButton"
        onClick={() => onMenuClicked()}
      >
        🍔
      </span>
    );
  }

  return (
    <span className="my-header" onClick={handleClick}>
      <img
        src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif"
        className="my-spinner"
      />
      {props.displayName} {sortState}
      {menu}
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

function createFlagImg(flag: string) {
  return (
    '<img border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' +
    flag +
    '.png"/>'
  );
}

const YearFloatingFilter = forwardRef((props: any, ref) => {
  // const [year, setYear] = useState('All');
  const [filterActive, setFilterActive] = useState();

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null value here
        setFilterActive(parentModel !== null);
      },
    };
  });

  const syncMainFilter = useCallback(
    (value) =>
      props.parentFilterInstance((instance) => {
        instance.setValueFromFloatingFilter(value);
      }),
    []
  );

  const onCheckboxChecked = useCallback(() => {
    syncMainFilter(!filterActive);
  }, [filterActive]);

  const style = useMemo(
    () => ({
      display: "inline-block",
      marginTop: "10px",
    }),
    []
  );

  return (
    <div style={style}>
      <label>
        <input
          type="checkbox"
          checked={filterActive}
          onChange={onCheckboxChecked}
        />{" "}
        &gt;= 2010
      </label>
    </div>
  );
});

function GridExample() {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [gridApi, setGridApi] = useState<GridApi>();
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Group A",
        headerGroupComponentFramework: GroupHeader,
        children: [
          { field: "country", filter: true },
          {
            field: "athlete",
            filter: true,
            headerComponentFramework: SortingHeader,
            headerComponentParams: { menuIcon: "fa-bars" },
          },
          {
            field: "year",
            floatingFilter: true,
            floatingFilterComponentFramework: YearFloatingFilter,
          },
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
      // flex: 1,
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

  const onCellEditingStarted = useCallback((event: CellEditingStartedEvent) => {
    console.log("🚀 onCellEditingStarted ~ event", event);
  }, []);

  const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent) => {
    console.log("🚀 onCellEditingStopped ~ event", event);
  }, []);

  const onRowEditingStarted = useCallback((event: RowEditingStartedEvent) => {
    console.log("🚀 onRowEditingStarted ~ event", event);
  }, []);

  const onRowEditingStopped = useCallback((event: RowEditingStoppedEvent) => {
    console.log("🚀 onCellEditingStopped ~ event", event);
  }, []);

  const onFilterOpened = useCallback((event: FilterOpenedEvent) => {
    console.log("🚀 onFilterOpened ~ event", event);
  }, []);

  const onFilterChanged = useCallback((event: RowEditingStoppedEvent) => {
    console.log("🚀 onFilterChanged ~ event", event);
  }, []);

  const onCellKeyDown = useCallback((event: CellKeyDownEvent) => {
    console.log("🚀 onCellKeyDown ~ event", event);
  }, []);

  const onCellKeyPress = useCallback((event: CellKeyPressEvent) => {
    console.log("🚀 onCellKeyPress ~ event", event);
  }, []);

  const onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
    console.log("🚀 firstDataRendered ~ event", event);
  }, []);

  const onBodyScroll = useCallback((event: BodyScrollEndEvent) => {
    console.log("🚀 onBodyScroll ~ event", event);
  }, []);

  const onRowDataChanged = useCallback((event: RowDataChangedEvent) => {
    console.log("🚀 onRowDataChanged ~ event", event);
  }, []);

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams) => {
      var result: (string | MenuItemDef)[] = [
        {
          name: "Alert " + params.value,
          action: function () {
            window.alert("Alerting about " + params.value);
          },
          cssClasses: ["redFont", "bold"],
        },
        {
          name: "Always Disabled",
          disabled: true,
          tooltip:
            "Very long tooltip, did I mention that I am very long, well I am! Long!  Very Long!",
        },
        {
          name: "Country",
          subMenu: [
            {
              name: "Ireland",
              action: function () {
                console.log("Ireland was pressed");
              },
              icon: createFlagImg("ie"),
            },
            {
              name: "UK",
              action: function () {
                console.log("UK was pressed");
              },
              icon: createFlagImg("gb"),
            },
            {
              name: "France",
              action: function () {
                console.log("France was pressed");
              },
              icon: createFlagImg("fr"),
            },
          ],
        },
        {
          name: "Person",
          subMenu: [
            {
              name: "Niall",
              action: function () {
                console.log("Niall was pressed");
              },
            },
            {
              name: "Sean",
              action: function () {
                console.log("Sean was pressed");
              },
            },
            {
              name: "John",
              action: function () {
                console.log("John was pressed");
              },
            },
            {
              name: "Alberto",
              action: function () {
                console.log("Alberto was pressed");
              },
            },
            {
              name: "Tony",
              action: function () {
                console.log("Tony was pressed");
              },
            },
            {
              name: "Andrew",
              action: function () {
                console.log("Andrew was pressed");
              },
            },
            {
              name: "Kev",
              action: function () {
                console.log("Kev was pressed");
              },
            },
            {
              name: "Will",
              action: function () {
                console.log("Will was pressed");
              },
            },
            {
              name: "Armaan",
              action: function () {
                console.log("Armaan was pressed");
              },
            },
          ],
        },
        "separator",
        {
          name: "Windows",
          shortcut: "Alt + W",
          action: function () {
            console.log("Windows Item Selected");
          },
          icon: '<img src="https://www.ag-grid.com/example-assets/skills/windows.png" />',
        },
        {
          name: "Mac",
          shortcut: "Alt + M",
          action: function () {
            console.log("Mac Item Selected");
          },
          icon: '<img src="https://www.ag-grid.com/example-assets/skills/mac.png"/>',
        },
        "separator",
        {
          name: "Checked",
          checked: true,
          action: function () {
            console.log("Checked Selected");
          },
          icon: '<img src="https://www.ag-grid.com/example-assets/skills/mac.png"/>',
        },
        "copy",
        "separator",
        "chartRange",
      ];
      return result;
    },
    []
  );

  const getMainMenuItems = useCallback(
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[] => {
      switch (params.column.getId()) {
        case "athlete": {
          const athleteMenuItems: (string | MenuItemDef)[] =
            params.defaultItems.slice(0);
          athleteMenuItems.push({
            name: "AG Grid Is Great",
            action: () => {
              console.log("AG Grid is great was selected");
            },
          });
          athleteMenuItems.push({
            name: "Casio Watch",
            action: () => {
              console.log("People who wear casio watches are cool");
            },
          });
          athleteMenuItems.push({
            name: "Custom Sub Menu",
            subMenu: [
              {
                name: "Black",
                action: () => {
                  console.log("Black was pressed");
                },
              },
              {
                name: "White",
                action: () => {
                  console.log("White was pressed");
                },
              },
              {
                name: "Grey",
                action: () => {
                  console.log("Grey was pressed");
                },
              },
            ],
          });
          return athleteMenuItems;
        }

        case "country": {
          const countryMenuItems: string[] = [];
          const itemsToExclude = ["separator", "pinSubMenu", "valueAggSubMenu"];
          params.defaultItems.forEach((item) => {
            if (itemsToExclude.indexOf(item) < 0) {
              countryMenuItems.push(item);
            }
          });
          return countryMenuItems;
        }

        default:
          return params.defaultItems;
      }
    },
    []
  );

  return (
    <div className="top-level">
      <div className="buttons-bar">
        <div>
          <button onClick={forceUpdate}>force rerender</button>
          <button onClick={onBtShowLoading}>Show Loading Overlay</button>
          <button onClick={onBtHideOverlay}>Hide Overlay</button>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          width: 800,
          height: 400,
        }}
      >
        <AgGridReact
          // turn on AG Grid React UI
          reactUi={true}
          // all other properties as normal...
          className="ag-theme-alpine"
          animateRows={true}
          // statusBar={statusBar}
          // sideBar={sideBar}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          // onGridReady={onGridReady}
          // rowSelection="multiple"
          // frameworkComponents={frameworkComponents}
          // loadingOverlayComponentFramework={MyLoadingOverlay}
          // onToolPanelVisibleChanged={onToolPanelVisibleChanged}
          // onPasteStart={onPasteStart}
          // onPasteEnd={onPasteEnd}
          // onColumnVisible={onColumnVisible}
          // onColumnResized={onColumnResized}
          // onCellValueChanged={onCellValueChanged}
          // onRowValueChanged={onRowValueChanged}
          context={context}
          onComponentStateChanged={onComponentStateChanged}
          onCellEditingStarted={onCellEditingStarted}
          onCellEditingStopped={onCellEditingStopped}
          // onRowEditingStarted={onRowEditingStarted}
          // onRowEditingStopped={onRowEditingStopped}
          // editType="fullRow"
          // onFilterOpened={onFilterOpened}
          // onFilterChanged={onFilterChanged}
          // onCellKeyDown={onCellKeyDown}
          // onCellKeyPress={onCellKeyPress}
          // onFirstDataRendered={onFirstDataRendered}
          // onBodyScroll={onBodyScroll}
          onRowDataChanged={onRowDataChanged}
          getContextMenuItems={getContextMenuItems}
          getMainMenuItems={getMainMenuItems}
        />
      </div>
    </div>
  );
}

export default GridExample;
