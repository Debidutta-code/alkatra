import React from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "@/Redux/store";
import { setDateRangeDetails } from "@/Redux/slices/hotelcard.slice";
import { useTranslation } from "react-i18next";

// Type for date range values
type DateRange = [Dayjs | null, Dayjs | null] | null;

const { RangePicker } = DatePicker;

type Props = {
  dates: string[] | undefined;
  setDates: React.Dispatch<React.SetStateAction<string[] | undefined>>;
};

const DateRange: React.FC<Props> = ({ dates, setDates }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Disable dates before today
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().startOf("day"));
  };

  // Handle date change
  const handleDateChange = (values: DateRange) => {
    if (values && values[0] && values[1]) {
      const formattedDates = values.map(date => date?.format("YYYY-MM-DD") || "");
      setDates(formattedDates as string[]);
      dispatch(setDateRangeDetails({ dates: formattedDates as string[] }));
    } else {
      setDates(undefined);
      dispatch(setDateRangeDetails({ dates: [] }));
    }
  };

  // Convert string dates to Dayjs objects if they exist
  const dayjsDates: DateRange = dates && dates.length === 2
    ? [dayjs(dates[0]), dayjs(dates[1])]
    : null;

  return (
    <div className="">
      <RangePicker
        value={dayjsDates}
        onChange={handleDateChange}
        disabledDate={disabledDate}
        suffixIcon={<></>}
        format="DD-MM-YYYY"
        picker="date"
        separator={<span className="lg:pr-4 px-2.5 text-tripswift-black/40">–</span>}
        allowClear={false}
        placeholder={[
          t("HotelBox.DateRange.checkInPlaceholder"),
          t("HotelBox.DateRange.checkOutPlaceholder")
        ]}
        className="w-full flex items-center [&_.ant-picker-input]:flex-1 [&_.ant-picker-input]:text-center [&_.ant-picker-range-separator]:flex-none"
        style={{ border: "none", background: "transparent" }}
      />
    </div>
  );
};

export default DateRange;