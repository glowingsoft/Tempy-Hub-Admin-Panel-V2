import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useGetFamilyPostsQuery } from 'src/store/Reducer/family-posts-api';

import { FAMILY_POSTS_PAGE_SIZE } from './utils';

// ----------------------------------------------------------------------

function getPostsErrorMessage(error) {
  return (
    error?.data?.message ||
    error?.error ||
    error?.message ||
    'Unable to load posts. Please try again.'
  );
}

export function useFamilyPostsFeed({ organizationId, branchId, filters, skip = false }) {
  const [page, setPage] = useState(1);
  const [feedGeneration, setFeedGeneration] = useState(0);
  const loadLockRef = useRef(false);

  const filterKey = useMemo(
    () => JSON.stringify({ organizationId, branchId, ...(filters || {}) }),
    [organizationId, branchId, filters]
  );
  const appliedFilterKeyRef = useRef(filterKey);
  const pageForQuery = appliedFilterKeyRef.current === filterKey ? page : 1;

  useEffect(() => {
    if (appliedFilterKeyRef.current === filterKey) return;
    appliedFilterKeyRef.current = filterKey;
    setPage(1);
    loadLockRef.current = false;
  }, [filterKey]);

  const queryArg = {
    organizationId,
    branchId,
    page: pageForQuery,
    limit: FAMILY_POSTS_PAGE_SIZE,
    feedGeneration,
    ...filters,
  };

  const canQuery = Boolean(organizationId && branchId) && !skip;

  const { data, error, isError, isFetching, isLoading, isUninitialized, refetch } = useGetFamilyPostsQuery(
    queryArg,
    { skip: !canQuery }
  );

  const posts = data?.data ?? [];
  const meta = data?.meta ?? {};
  const currentPage = Number(meta.currentPage) || pageForQuery;
  const totalPages = Number(meta.totalPages) || 1;
  const hasNextPage = canQuery && !isError && currentPage < totalPages && posts.length > 0;

  const isFilterLoading = canQuery && (isLoading || isUninitialized || (isFetching && pageForQuery === 1));
  const isLoadingMore = canQuery && isFetching && pageForQuery > 1;
  const loadError = canQuery && isError ? getPostsErrorMessage(error) : '';
  const isInitialError = Boolean(loadError) && posts.length === 0;
  const isLoadMoreError = Boolean(loadError) && posts.length > 0;

  useEffect(() => {
    if (!isFetching) {
      loadLockRef.current = false;
    }
  }, [isFetching]);

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetching || isUninitialized || loadLockRef.current) return;
    loadLockRef.current = true;
    setPage((prev) => prev + 1);
  }, [hasNextPage, isFetching, isUninitialized]);

  const resetFeed = useCallback(() => {
    loadLockRef.current = false;
    setPage(1);
    setFeedGeneration((generation) => generation + 1);
  }, []);

  const retry = useCallback(() => {
    loadLockRef.current = false;
    refetch();
  }, [refetch]);

  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        loadNextPage();
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loadNextPage, posts.length]);

  return {
    posts,
    meta,
    sentinelRef,
    isFilterLoading,
    isLoadingMore,
    loadError,
    isInitialError,
    isLoadMoreError,
    hasNextPage,
    loadNextPage,
    resetFeed,
    retry,
  };
}
