import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },

  reducers: {
    setUser: (state, action) => {
      const user = { ...action.payload };
      user.displayName = `${user?.basicInfo?.name}`;
      state.user = user;
    },

    mergeMeProfile: (state, action) => {
      if (!state.user) return;

      const me = action.payload || {};
      const profile = me.user && typeof me.user === 'object' ? me.user : {};
      const nextAccess = {
        ...(state.user.access || {}),
        ...(me.access || {}),
      };

      state.user = {
        ...state.user,
        basicInfo: profile.basicInfo || state.user.basicInfo,
        accountState: profile.accountState || state.user.accountState,
        metadata: profile.metadata || state.user.metadata,
        audience: me.audience ?? state.user.audience,
        role: me.role ?? state.user.role,
        surface: me.surface ?? state.user.surface,
        access: nextAccess,
        staffProfile: me.staffProfile ?? state.user.staffProfile,
        hasDirectReports: me.hasDirectReports ?? state.user.hasDirectReports,
        token: state.user.token,
        permission: state.user.permission,
        displayName:
          profile.basicInfo?.name || state.user.displayName || state.user.basicInfo?.name,
      };
    },

    logout: (state) => {
      console.log('userSlice - Logging out');
      state.user = null;
    },
  },
});

// Exporting actions
export const { setUser, mergeMeProfile, logout } = userSlice.actions;
export const selectUser = (state) => state.user.user;

// Exporting the reducer
export default userSlice.reducer;


// // redux/userSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const userSlice = createSlice({
//   name: 'user', // The name of the slice
//   initialState: { user: null }, // The initial state of the slice

//   reducers: {
//     setUser: (state, action) => {
//       const user = { ...action.payload };
//       console.log('userSlice', user);
//       user.displayName = `${user?.basicInfo?.name}`
//       state.user = user;
//     },

//     // Action to set the user in the state
//     logout: (state) => {
//       localStorage.clear();
//       state.user = null
//     },
//     // Action to clear the user from the state
//   },
// });

// // Exporting actions
// export const { setUser, logout } = userSlice.actions;
// export const selectUser = (state) => state.user.user;
// // Exporting the reducer
// export default userSlice.reducer;
