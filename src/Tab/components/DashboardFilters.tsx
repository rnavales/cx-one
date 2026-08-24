type FilterType =
  | "Today"
  | "Week"
  | "Month";

interface Props {
  selectedFilter: FilterType;
  onFilterChange: (
    filter: FilterType
  ) => void;
}

export default function DashboardFilters({
  selectedFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="filter-bar">
      <button
        className={
          selectedFilter === "Today"
            ? "filter-active"
            : ""
        }
        onClick={() =>
          onFilterChange("Today")
        }
      >
        Today
      </button>

      <button
        className={
          selectedFilter === "Week"
            ? "filter-active"
            : ""
        }
        onClick={() =>
          onFilterChange("Week")
        }
      >
        Week
      </button>

      <button
        className={
          selectedFilter === "Month"
            ? "filter-active"
            : ""
        }
        onClick={() =>
          onFilterChange("Month")
        }
      >
        Month
      </button>
    </div>
  );
}

// END OF FILE