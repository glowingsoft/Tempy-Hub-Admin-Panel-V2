import { toast } from 'src/components/snackbar';
import { handleApiError as extractBackendError } from 'src/store/handleApiError';

export const extractErrorMessage = (error) => extractBackendError(error);

export const handleApiError = (error) => {
    const message = extractErrorMessage(error);
    if (message) {
        toast.apiError(message);
    }
    console.error('API Error:', error);
};
