import { CONFIG } from 'src/config-global';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';

import { FAMILY_GROUP_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

export const widgetIcon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export const FAMILY_GROUP_TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'resident', label: 'Resident', minWidth: 220 },
  { id: 'nok', label: 'Next of kin', minWidth: 200 },
  { id: 'members', label: 'Members', width: 120 },
  { id: 'status', label: 'Status', align: 'center', width: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: 120 },
];

export const FAMILY_GROUP_MEMBER_TABLE_HEAD = [
  { id: 'member', label: 'Member' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'role', label: 'Portal role' },
  { id: 'nok', label: 'Next of kin', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'joined', label: 'Joined' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

export const FAMILY_GROUP_FILTER_FIELDS = [
  createFilterField.status({
    options: FAMILY_GROUP_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident or next of kin...',
  }),
];
