import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import updateCalendarObject from "../features/updateCalendarObject";

const EditableField = (
  {calendarItemIndex,
  fieldName,
  calendarData,
  setCalendarData}
) => {

    if (!calendarData) return <></>
  return (
    <TextareaAutosize
      onChange={(event) => {
        updateCalendarObject(
          event.target.value,
          calendarItemIndex,
          fieldName,
          calendarData,
          setCalendarData
        );
      }}
      value={calendarData[calendarItemIndex][fieldName]}
      style={{
        height: "100%",
        width: "100%",
        maxWidth: "100%",
        border: "none",
        color: "rgba(0, 0, 0, 0.6)",
        marginBottom: '5px'
      }}
    />
  );
};

export default EditableField;
