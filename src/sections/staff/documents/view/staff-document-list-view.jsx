import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useDebounce } from 'src/hooks/use-debounce';
import { paths } from 'src/routes/paths';

import { getStaffDocuments } from '../mocks/data';
import { StaffDocumentTableRow } from './staff-document-table-row';
import { StaffDocumentPreviewDialog } from './staff-document-preview-dialog';

const SEARCH_FIELD = createFilterField.search({ placeholder: 'Search documents...' });
const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'title', label: 'Document', minWidth: 280 },
    { id: 'createdAt', label: 'Created At', width: 150 },
    { id: 'acknowledged', label: 'Status', width: 140, align: 'center' },
    { id: 'actions', label: 'Actions', minWidth: 120, align: 'center' },
];

export function StaffDocumentListView() {
    const table = useTable();
    const documents = getStaffDocuments();
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [search, setSearch] = useState('');
    const keyword = useDebounce(search, 400);

    const filteredDocuments = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        return documents.filter((document) => !query || document.name?.toLowerCase().includes(query));
    }, [documents, keyword]);

    const handleSearchChange = useCallback((event) => {
        setSearch(event.target.value);
        table.onResetPage();
    }, [table]);

    const handleView = useCallback((document) => {
        setSelectedDocument(document);
    }, []);

    const paginatedDocuments = filteredDocuments.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Documents"
                links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'Documents' }]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Card>
                <FlexibleTableToolbar
                    filterFields={[SEARCH_FIELD]}
                    filterValues={{ search }}
                    onFilterChange={() => { }}
                    onSearchChange={handleSearchChange}
                />
                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                            <TableHeadCustom headLabel={TABLE_HEAD} />
                            <TableBody>
                                {paginatedDocuments.map((row, index) => (
                                    <StaffDocumentTableRow
                                        key={row._id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                        onView={handleView}
                                    />
                                ))}
                                <TableNoData notFound={!filteredDocuments.length} title="No documents found" />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>
                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredDocuments.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
            <StaffDocumentPreviewDialog
                document={selectedDocument}
                open={!!selectedDocument}
                onClose={() => setSelectedDocument(null)}
            />
        </DashboardContent>
    );
}
