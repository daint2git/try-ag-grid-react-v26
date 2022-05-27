import {
  ICellRendererParams,
  RowNode,
  RowSelectedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

export default (
  props: ICellRendererParams & { flagCodes: Record<string, string> }
) => {
  const node = props.node;
  const aggData = node.aggData;
  const flagCode = props.flagCodes[node.key!];

  const [flagCodeImg, setFlagCodeImg] = useState(
    `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`
  );
  const [countryName, setCountryName] = useState(node.key);
  const [goldCount, setGoldCount] = useState(aggData.gold);
  const [silverCount, setSilverCount] = useState(aggData.silver);
  const [bronzeCount, setBronzeCount] = useState(aggData.bronze);

  useEffect(() => {
    setFlagCodeImg(`https://flags.fmcdn.net/data/flags/mini/${flagCode}.png`);
  }, []);

  let img = null;
  if (flagCode) {
    img = <img className="flag" width="20" height="15" src={flagCodeImg} />;
  }

  const checkboxRef = useRef<HTMLInputElement>(null);

  const { api: gridApi, columnApi } = props;
  const [checked, setChecked] = useState<boolean | undefined>(false);

  const toggleExpansion = () => {
    gridApi.setRowNodeExpanded(node, !node.expanded);
  };

  useEffect(() => {
    const listener = (e: RowSelectedEvent) => {
      const selected = e.node.isSelected();

      setChecked(selected);

      if (checkboxRef.current) {
        checkboxRef.current.checked = selected!;
        checkboxRef.current.indeterminate = selected === undefined;
      }
    };

    node.addEventListener(RowNode.EVENT_ROW_SELECTED, listener);

    return () => {
      node.removeEventListener(RowNode.EVENT_ROW_SELECTED, listener);
    };
  }, [node]);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextChecked = e.target.checked;
    node.allLeafChildren.forEach((child) => {
      child.setSelected(nextChecked);
    });
  };

  return (
    <div className="group-row-inner">
      <div style={{ display: "inline-block" }}>
        <span className="toggle" onClick={toggleExpansion}>
          {node.expanded ? "˅" : "˄"}
        </span>
        <span>{img}</span>
        <span className="groupTitle">{countryName}</span>
        <span
          className="medal gold"
          aria-label={`${countryName} - ${goldCount} gold medals`}
        >
          <i className="fas fa-medal"></i>
          {goldCount}
        </span>
        <span
          className="medal silver"
          aria-label={`${countryName} - ${silverCount} silver medals`}
        >
          <i className="fas fa-medal"></i>
          {silverCount}
        </span>
        <span
          className="medal bronze"
          aria-label={`${countryName} - ${bronzeCount} bronze medals`}
        >
          <i className="fas fa-medal"></i>
          {bronzeCount}
        </span>
      </div>
      <div style={{ paddingRight: 20 }}>
        {" "}
        <input
          ref={checkboxRef}
          type={"checkbox"}
          // checked={checked}
          // indeterminate="true"
          onChange={handleCheckboxChange}
        />
      </div>
    </div>
  );
};
