import { useRef, useState, useEffect, useCallback } from 'react';

import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------
// A <TableCell> that truncates its content and shows a tooltip ONLY when the
// content is actually clipped — by width (single line) or by line count
// (`lines` > 1). If everything fits, no tooltip is rendered.
//
// Usage:
//   <TableCellWithTooltip maxWidth={240}>{row.address}</TableCellWithTooltip>
//   <TableCellWithTooltip lines={2} maxWidth={280}>{row.notes}</TableCellWithTooltip>
//   <TableCellWithTooltip title={fullText}> <SomeNode /> </TableCellWithTooltip>
// ----------------------------------------------------------------------

export function TableCellWithTooltip({
  children,
  title,
  lines = 1,
  maxWidth = 200,
  tooltipProps,
  sx,
  ...cellProps
}) {
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const overflow =
      lines > 1
        ? el.scrollHeight > el.clientHeight + 1
        : el.scrollWidth > el.clientWidth + 1;

    setIsOverflowing(overflow);
  }, [lines]);

  useEffect(() => {
    // Wait for layout to settle (table columns size after paint).
    const raf = requestAnimationFrame(checkOverflow);

    const el = contentRef.current;
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(checkOverflow) : null;
    if (observer && el) observer.observe(el);

    window.addEventListener('resize', checkOverflow);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, children]);

  const tooltipTitle = title ?? (typeof children === 'string' ? children : '');

  const clampSx =
    lines > 1
      ? {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: lines,
          overflow: 'hidden',
        }
      : {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        };

  return (
    <TableCell sx={{ maxWidth, ...sx }} {...cellProps}>
      <Tooltip
        arrow
        placement="top"
        disableInteractive
        title={isOverflowing ? tooltipTitle : ''}
        {...tooltipProps}
      >
        <span
          ref={contentRef}
          onMouseEnter={checkOverflow}
          onFocus={checkOverflow}
          style={{
            display: 'block',
            maxWidth: '100%',
            cursor: isOverflowing ? 'help' : 'inherit',
            ...clampSx,
          }}
        >
          {children}
        </span>
      </Tooltip>
    </TableCell>
  );
}

// Backwards-compatible default export (previous name).
export default TableCellWithTooltip;
