import {
  ColDef,
  ICellEditorParams,
  IHeaderGroupParams,
  IHeaderParams,
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
import "./UIEditor.css";

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

  console.log("", props);

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

function GridExample() {
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
      flex: 1,
    }),
    []
  );

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((resp) => resp.json())
      .then((data) => setRowData(data));
  }, []);

  return (
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
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={rowData}
      />
    </div>
  );
}

export default GridExample;
