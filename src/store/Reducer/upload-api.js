import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';

const createUploadRequest = (file) => {
  const formData = new FormData();
  formData.append('files', file);
  return {
    url: API_ROUTES.UPLOAD_S3,
    method: 'POST',
    body: formData,
  };
};

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.user?.user?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: createUploadRequest,
      transformResponse: (res) => {
        const first = res?.data?.[0];
        if (!first) throw new Error('Upload returned no file data.');
        return first;
      },
    }),
    uploadImage: builder.mutation({
      queryFn: async (file, _queryApi, _extraOptions, baseQuery) => {
        if (!file || !file.type?.toLowerCase().startsWith('image/')) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Only image files are allowed.',
            },
          };
        }

        const response = await baseQuery(createUploadRequest(file));
        if (response.error) return response;

        const first = response.data?.data?.[0];
        if (!first) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Upload returned no file data.',
            },
          };
        }

        return { data: first };
      },
    }),
  }),
});

export const { useUploadFileMutation, useUploadImageMutation } = uploadApi;