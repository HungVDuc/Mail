import { useState } from "react";
import "../styles/searchbar.css";
import { FaFilter } from "react-icons/fa";

export default function SearchBar({
  value,
  onChange,
  handleSearch,
  filters,
  onFilterChange,
  hideFromField = false,
}) {
  const [showFilter, setShowFilter] = useState(false);

  const toggleFilter = () => setShowFilter(!showFilter);

  return (
    <div className="searchbar-container">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search emails..."
        />
        <button
          type="button"
          className="filter-toggle"
          onClick={toggleFilter}
          title="Lọc nâng cao"
        >
          <FaFilter />
        </button>

        <button type="submit">Search</button>
      </form>

      {showFilter && (
        <div className="filter-panel">
          {!hideFromField && (
            <input
              type="text"
              placeholder="Người gửi"
              value={filters.from}
              onChange={(e) =>
                onFilterChange({ ...filters, from: e.target.value })
              }
            />
          )}
          <input
            type="text"
            placeholder="Tiêu đề"
            value={filters.subject}
            onChange={(e) =>
              onFilterChange({ ...filters, subject: e.target.value })
            }
          />
          <div className="date-range">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                onFilterChange({ ...filters, fromDate: e.target.value })
              }
            />
            <span>→</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                onFilterChange({ ...filters, toDate: e.target.value })
              }
            />
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.hasAttachment}
              onChange={(e) =>
                onFilterChange({ ...filters, hasAttachment: e.target.checked })
              }
            />
            Có file đính kèm
          </label>
        </div>
      )}
    </div>
  );
}
