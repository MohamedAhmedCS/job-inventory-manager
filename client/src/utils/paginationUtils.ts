export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function getPaginatedItems<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

export function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const maxPagesShown = 5;
  const pages: number[] = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesShown / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesShown - 1);

  if (endPage - startPage < maxPagesShown - 1) {
    startPage = Math.max(1, endPage - maxPagesShown + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}
