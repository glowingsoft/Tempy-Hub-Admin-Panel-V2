import { configureStore, createAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { authApi } from './Reducer/auth';
import userReducer, { logout } from './slices/userSlice';
import { walletsApi } from './Reducer/wallets-api';
import { categoriesApi } from './Reducer/categories-api';
import { organizationsApi } from './Reducer/organizations-api';
import { departmentsApi } from './Reducer/departments-api';
import { jobTitlesApi } from './Reducer/job-titles-api';
import { branchesApi } from './Reducer/branches-api';
import { invitationsApi } from './Reducer/invitations-api';
import { membersApi } from './Reducer/members-api';
import { staffProfilesApi } from './Reducer/staff-profiles-api';
import { shiftsApi } from './Reducer/shifts-api';
import { shiftClaimsApi } from './Reducer/shift-claims-api';
import { leaveRequestsApi } from './Reducer/leave-requests-api';
import { residentsApi } from './Reducer/residents-api';
import { attendanceApi } from './Reducer/attendance-api';
import { generalDirectoryApi } from './Reducer/general-directory-api';
import { evacuationsApi } from './Reducer/evacuations-api';
import { peepFloorPlanApi } from './Reducer/peep-floor-plan-api';
import { floorPlansApi } from './Reducer/floor-plans-api';
import { uploadApi } from './Reducer/upload-api';
import { supervisionApi } from './Reducer/supervision-api';
import { appraisalsApi } from './Reducer/appraisals-api';
import { familyUploadsApi } from './Reducer/family-uploads-api';
import { familyInvitationsApi } from './Reducer/family-invitations-api';
import { familyGroupsApi } from './Reducer/family-groups-api';
import { familyMembersApi } from './Reducer/family-members-api';
import { familyPostsApi } from './Reducer/family-posts-api';
import { documentsApi } from './Reducer/documents-api';
import { documentCategoriesApi } from './Reducer/document-categories-api';
import { kiosksApi } from './Reducer/kiosks-api';

// Vite/Rolldown does not unwrap redux-persist's CJS `lib/storage` default export,
// so `storage.getItem` is undefined. Use a promise-based localStorage adapter instead.
const persistStorage = {
  getItem: (key) => {
    try {
      return Promise.resolve(window.localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore quota / private-mode failures
    }
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage access failures
    }
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage: persistStorage,
  whitelist: ['user'],
};

// Action to reset all API caches
export const resetApiState = createAction('api/resetApiState');

const apiSlices = [
  authApi,
  walletsApi,
  categoriesApi,
  organizationsApi,
  departmentsApi,
  jobTitlesApi,
  branchesApi,
  invitationsApi,
  membersApi,
  staffProfilesApi,
  shiftsApi,
  shiftClaimsApi,
  leaveRequestsApi,
  residentsApi,
  attendanceApi,
  generalDirectoryApi,
  evacuationsApi,
  peepFloorPlanApi,
  floorPlansApi,
  uploadApi,
  supervisionApi,
  appraisalsApi,
  familyUploadsApi,
  familyInvitationsApi,
  familyGroupsApi,
  familyMembersApi,
  familyPostsApi,
  documentsApi,
  documentCategoriesApi,
  kiosksApi,
];

const clearApiCachesOnLogout = ({ dispatch }) => (next) => (action) => {
  const result = next(action);

  if (logout.match(action)) {
    apiSlices.forEach((apiSlice) => dispatch(apiSlice.util.resetApiState()));
  }

  return result;
};

// Create a persisted reducer for the user slice
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Create the Redux store with the persisted reducer for the user slice
export const store = configureStore({
  reducer: {
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [walletsApi.reducerPath]: walletsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [organizationsApi.reducerPath]: organizationsApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [jobTitlesApi.reducerPath]: jobTitlesApi.reducer,
    [branchesApi.reducerPath]: branchesApi.reducer,
    [invitationsApi.reducerPath]: invitationsApi.reducer,
    [membersApi.reducerPath]: membersApi.reducer,
    [staffProfilesApi.reducerPath]: staffProfilesApi.reducer,
    [shiftsApi.reducerPath]: shiftsApi.reducer,
    [shiftClaimsApi.reducerPath]: shiftClaimsApi.reducer,
    [leaveRequestsApi.reducerPath]: leaveRequestsApi.reducer,
    [residentsApi.reducerPath]: residentsApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [generalDirectoryApi.reducerPath]: generalDirectoryApi.reducer,
    [evacuationsApi.reducerPath]: evacuationsApi.reducer,
    [peepFloorPlanApi.reducerPath]: peepFloorPlanApi.reducer,
    [floorPlansApi.reducerPath]: floorPlansApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [supervisionApi.reducerPath]: supervisionApi.reducer,
    [appraisalsApi.reducerPath]: appraisalsApi.reducer,
    [familyUploadsApi.reducerPath]: familyUploadsApi.reducer,
    [familyInvitationsApi.reducerPath]: familyInvitationsApi.reducer,
    [familyGroupsApi.reducerPath]: familyGroupsApi.reducer,
    [familyMembersApi.reducerPath]: familyMembersApi.reducer,
    [familyPostsApi.reducerPath]: familyPostsApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [documentCategoriesApi.reducerPath]: documentCategoriesApi.reducer,
    [kiosksApi.reducerPath]: kiosksApi.reducer,

    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      walletsApi.middleware,
      categoriesApi.middleware,
      organizationsApi.middleware,
      departmentsApi.middleware,
      jobTitlesApi.middleware,
      branchesApi.middleware,
      invitationsApi.middleware,
      membersApi.middleware,
      staffProfilesApi.middleware,
      shiftsApi.middleware,
      shiftClaimsApi.middleware,
      leaveRequestsApi.middleware,
      residentsApi.middleware,
      attendanceApi.middleware,
      generalDirectoryApi.middleware,
      evacuationsApi.middleware,
      peepFloorPlanApi.middleware,
      floorPlansApi.middleware,
      uploadApi.middleware,
      supervisionApi.middleware,
      appraisalsApi.middleware,
      familyUploadsApi.middleware,
      familyInvitationsApi.middleware,
      familyGroupsApi.middleware,
      familyMembersApi.middleware,
      familyPostsApi.middleware,
      documentsApi.middleware,
      documentCategoriesApi.middleware,
      kiosksApi.middleware,
      clearApiCachesOnLogout,
    ),
});

// Initialize Redux Persist
export const persistor = persistStore(store);

// Setup listeners
setupListeners(store.dispatch);

// import { configureStore, createAction } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistReducer, persistStore } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { authApi } from './Reducer/auth';
// import userReducer from './slices/userSlice';
// import { walletsApi } from './Reducer/wallets-api';
// import { transactionsApi } from './Reducer/transactions-api';
// import { categoriesApi } from './Reducer/categories-api';

// const persistConfig = {
//   key: 'root',
//   storage,
//   // whitelist: ['user'],
// };

// export const resetStore = createAction('RESET_STORE');

// // Create a persisted reducer for the user slice
// const persistedUserReducer = persistReducer(persistConfig, userReducer);

// // Create the Redux store with the persisted reducer for the user slice
// export const store = configureStore({
//   reducer: {
//     [categoriesApi.reducerPath]: categoriesApi.reducer,
//     [transactionsApi.reducerPath]: transactionsApi.reducer,
//     [walletsApi.reducerPath]: walletsApi.reducer,
//     [authApi.reducerPath]: authApi.reducer,
//     user: persistedUserReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
//       },
//     }).concat(authApi.middleware,
//       walletsApi.middleware, transactionsApi.middleware, categoriesApi.middleware),
// });

// // Initialize Redux Persist
// export const persistor = persistStore(store);

// // Setup listeners
// setupListeners(store.dispatch);