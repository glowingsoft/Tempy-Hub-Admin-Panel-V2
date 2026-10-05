import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function FamilyIssueChecklist({
  issueNumber = 'Issue 14',
  tasks = [],
  onToggleTask,
  sx,
  ...other
}) {
  return (
    <Card sx={{ ...sx }} {...other}>
      <CardHeader
        title={
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.8125rem',
            }}
          >
            CHECKLIST BEFORE {issueNumber.toUpperCase()} CLOSES
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      <Box sx={{ p: 3, pt: 1.5 }}>
        <Stack spacing={1}>
          {tasks.map((task, index) => {
            const isDone = !!task.completed;
            const number = task.stepNumber || index + 1;

            return (
              <Box
                key={task.id}
                onClick={() => onToggleTask?.(task.id)}
                sx={{
                  py: 0.75,
                  px: 1.25,
                  borderRadius: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  width: 'fit-content',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: isDone ? 'text.disabled' : 'text.primary',
                    textDecoration: isDone ? 'line-through' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {number}. {task.text}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}

FamilyIssueChecklist.propTypes = {
  issueNumber: PropTypes.string,
  tasks: PropTypes.array,
  onToggleTask: PropTypes.func,
  sx: PropTypes.object,
};
