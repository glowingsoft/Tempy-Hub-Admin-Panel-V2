import { Box, Skeleton, TableCell, TableRow } from '@mui/material';

const UserLoadingSkeleton = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                    {/* Sr# */}
                    <TableCell>
                        <Skeleton variant="text" width={20} height={20} />
                    </TableCell>

                    {/* Avatar + Name/Email */}
                    <TableCell sx={{ width: "290px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box>
                                <Skeleton variant="text" width={130} height={18} />
                                <Skeleton variant="text" width={180} height={14} sx={{ mt: 0.5 }} />
                            </Box>
                        </Box>
                    </TableCell>

                    {/* Phone */}
                    <TableCell >
                        <Skeleton variant="text" width={100} height={18}  />
                    </TableCell>

                    <TableCell>
                        <Skeleton variant="text" width={100} height={18} />
                    </TableCell>

                    {/* Status */}
                      <TableCell align="center">
                        <Skeleton variant="rounded" width={60} height={23} sx={{mx:"auto"}} />
                    </TableCell>
                      <TableCell>
                        <Skeleton variant="rounded" width={60} height={23} sx={{mx:"auto"}} />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="rounded" width={60} height={23} sx={{mx:"auto"}} />
                    </TableCell>

                      <TableCell>
                        <Skeleton variant="rounded" width={60} height={23} sx={{mx:"auto"}} />
                    </TableCell>

                    <TableCell >
                        <Skeleton variant="text" width={100} height={18}  />
                    </TableCell>

                    <TableCell>
                        <Skeleton variant="text" width={100} height={18} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Skeleton variant="circular" width={28} height={28} />
                            <Skeleton variant="circular" width={28} height={28} />
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default UserLoadingSkeleton;