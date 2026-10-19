import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useDebounce } from 'src/hooks/use-debounce';

// ----------------------------------------------------------------------

const DEFAULT_LIMIT = 100;
const DEFAULT_DEBOUNCE_MS = 400;
const SCROLL_THRESHOLD_PX = 48;

function mergeUniqueOptions(extraOptions, fetchedOptions, selected) {
  const list = [];
  const seen = new Set();

  const push = (option) => {
    if (!option?.value || seen.has(option.value)) return;
    seen.add(option.value);
    list.push(option);
  };

  extraOptions.forEach(push);
  fetchedOptions.forEach(push);
  (Array.isArray(selected) ? selected : selected ? [selected] : []).forEach(push);

  return list;
}

function resolveSelectedLabels(selected, fetchedOptions) {
  if (!fetchedOptions.length) return selected;

  const labelByValue = new Map(fetchedOptions.map((option) => [option.value, option]));

  if (Array.isArray(selected)) {
    let changed = false;
    const next = selected.map((item) => {
      const match = labelByValue.get(item?.value);
      if (match && match.label !== item.label) {
        changed = true;
        return match;
      }
      return item;
    });
    return changed ? next : selected;
  }

  const match = selected?.value ? labelByValue.get(selected.value) : null;
  if (match && match.label !== selected.label) {
    return match;
  }

  return selected;
}

const InfiniteListbox = forwardRef(function InfiniteListbox({ loadingMore, children, ...other }, ref) {
  return (
    <ul ref={ref} {...other}>
      {children}
      {loadingMore ? (
        <li
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <CircularProgress size={18} />
        </li>
      ) : null}
    </ul>
  );
});

function hasMorePages(meta, page, limit, receivedCount) {
  const totalPages = Number(meta?.totalPages);
  if (Number.isFinite(totalPages) && totalPages > 0) {
    return page < totalPages;
  }

  const totalRecords = Number(meta?.totalRecords);
  if (Number.isFinite(totalRecords)) {
    return page * limit < totalRecords;
  }

  return receivedCount >= limit;
}

// ----------------------------------------------------------------------

export function InfiniteAutocomplete({
  value,
  onChange,
  useQuery,
  queryArgs = {},
  mapOption,
  extraOptions = [],
  limit = DEFAULT_LIMIT,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  enabled = true,
  label,
  placeholder,
  helperText,
  error = false,
  disabled = false,
  multiple = false,
  textFieldProps,
  ...other
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [fetchedOptions, setFetchedOptions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  const debouncedKeyword = useDebounce(inputValue.trim(), debounceMs);
  const skip = !enabled;

  const queryParams = {
    ...queryArgs,
    page,
    limit,
    ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
  };

  const { data, isFetching, isLoading } = useQuery(queryParams, { skip });

  useEffect(() => {
    setPage(1);
    setFetchedOptions([]);
    setHasMore(true);
  }, [debouncedKeyword, queryArgs?.organizationId]);

  useEffect(() => {
    if (skip || !data) return;

    const rows = Array.isArray(data.data) ? data.data : [];
    const mapped = rows.map(mapOption).filter((option) => option?.value);

    setFetchedOptions((previous) => {
      if (page === 1) return mapped;
      const seen = new Set(previous.map((item) => item.value));
      return [...previous, ...mapped.filter((item) => !seen.has(item.value))];
    });
    setHasMore(hasMorePages(data.meta, page, limit, mapped.length));
    loadingMoreRef.current = false;
  }, [data, limit, mapOption, page, skip]);

  useEffect(() => {
    if (!isFetching) {
      loadingMoreRef.current = false;
    }
  }, [isFetching]);

  useEffect(() => {
    if (!fetchedOptions.length) return;

    const resolved = resolveSelectedLabels(value, fetchedOptions);
    if (resolved !== value) {
      onChange(resolved);
    }
  }, [fetchedOptions, onChange, value]);

  const options = useMemo(
    () => mergeUniqueOptions(extraOptions, fetchedOptions, value),
    [extraOptions, fetchedOptions, value]
  );

  const showInitialLoading = (isLoading || isFetching) && fetchedOptions.length === 0 && !skip;
  const showLoadMore = isFetching && page > 1;

  const handleScroll = (event) => {
    if (!hasMore || isFetching || loadingMoreRef.current) return;

    const listbox = event.currentTarget;
    const distanceFromBottom = listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight;

    if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
      loadingMoreRef.current = true;
      setPage((current) => current + 1);
    }
  };

  return (
    <Autocomplete
      value={multiple ? value ?? [] : value ?? null}
      options={options}
      multiple={multiple}
      disabled={disabled}
      loading={showInitialLoading}
      filterOptions={(current) => current}
      getOptionLabel={(option) => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        const match = options.find((item) => item.value === option.value);
        return match?.label || option.label || '';
      }}
      isOptionEqualToValue={(option, selected) => option?.value === selected?.value}
      onOpen={() => {
        setPopupOpen(true);
        setInputValue('');
      }}
      onClose={() => {
        setPopupOpen(false);
        setInputValue('');
      }}
      open={popupOpen}
      inputValue={multiple || popupOpen ? inputValue : value?.label || ''}
      onInputChange={(event, nextValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(nextValue);
        }
      }}
      onChange={(event, nextValue) => onChange(nextValue)}
      noOptionsText={showInitialLoading ? 'Loading...' : 'No results found'}
      loadingText="Loading..."
      ListboxComponent={InfiniteListbox}
      ListboxProps={{
        onScroll: handleScroll,
        sx: { maxHeight: 280 },
        loadingMore: showLoadMore,
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {option.label}
          </Typography>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
          }}
          InputProps={{
            ...params.InputProps,
            ...textFieldProps?.InputProps,
            endAdornment: (
              <>
                {showInitialLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...other}
    />
  );
}
