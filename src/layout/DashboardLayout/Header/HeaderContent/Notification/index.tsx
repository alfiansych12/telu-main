'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// MATERIAL - UI
import { useTheme } from '@mui/material/styles';
import {
    Badge,
    Box,
    ClickAwayListener,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Popper,
    Stack,
    Typography,
    Divider,
    Button
} from '@mui/material';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import { getNotificationSummary, markAsRead, markAllAsRead } from 'utils/api/notifications';

// ASSETS
import { Notification as NotificationIcon } from 'iconsax-react';

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Notification = () => {
    const theme = useTheme();
    const router = useRouter();
    const anchorRef = useRef<any>(null);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    // Use TanStack Query for better caching and automatic management
    const { data: notificationData, refetch } = useQuery({
        queryKey: ['notifications-summary'],
        queryFn: () => getNotificationSummary(10),
        refetchInterval: 300000, // Refresh every 5 minutes
        staleTime: 300000,
    });

    useEffect(() => {
        if (notificationData) {
            setNotifications(notificationData.notifications);
            setUnreadCount(notificationData.unreadCount);
        }
    }, [notificationData]);

    const handleMarkAsRead = async (id: string, link?: string) => {
        await markAsRead(id);
        refetch();
        if (link) {
            router.push(link);
            setOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        refetch();
    };

    const iconBackColorOpen = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

    return (
        <Box sx={{ flexShrink: 0, ml: 0.75 }}>
            <IconButton
                color="secondary"
                sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
                aria-label="open profile"
                ref={anchorRef}
                aria-controls={open ? 'profile-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
            >
                <Badge badgeContent={unreadCount} color="primary">
                    <NotificationIcon size={24} variant="Bold" />
                </Badge>
            </IconButton>
            <Popper
                placement="bottom-end"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 9]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
                        <Paper
                            sx={{
                                boxShadow: theme.customShadows?.z1 || '0 2px 14px 0 rgba(0,0,0,0.1)',
                                width: 300,
                                minWidth: 300,
                                maxWidth: 400,
                                [theme.breakpoints.down('md')]: {
                                    width: 285
                                }
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} content={false}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                                        <Typography variant="h5">Notifications</Typography>
                                        {unreadCount > 0 && (
                                            <Button variant="text" size="small" onClick={handleMarkAllRead}>
                                                Mark all as read
                                            </Button>
                                        )}
                                    </Stack>
                                    <Divider />
                                    <List
                                        component="nav"
                                        sx={{
                                            p: 0,
                                            '& .MuiListItemButton-root': {
                                                py: 0.5,
                                                '&.Mui-selected': { bgcolor: 'primary.lighter', color: 'primary.main' },
                                                '& .MuiAvatar-root': { bgcolor: 'primary.lighter', color: 'primary.main', width: 34, height: 34, fontSize: '1rem' }
                                            }
                                        }}
                                    >
                                        {notifications.length === 0 ? (
                                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No notifications yet
                                                </Typography>
                                            </Box>
                                        ) : (
                                            notifications.map((item) => (
                                                <Box key={item.id}>
                                                    <ListItemButton
                                                        selected={!item.is_read}
                                                        onClick={() => handleMarkAsRead(item.id, item.link)}
                                                        sx={{
                                                            bgcolor: item.is_read ? 'transparent' : 'action.hover',
                                                            '&:hover': { bgcolor: 'action.hover' }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: item.is_read ? 400 : 700 }}>
                                                                    {item.title}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {item.message}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.disabled">
                                                                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                                                    </Typography>
                                                                </Stack>
                                                            }
                                                        />
                                                    </ListItemButton>
                                                    <Divider />
                                                </Box>
                                            ))
                                        )}
                                    </List>
                                    {notifications.length > 0 && (
                                        <Box sx={{ p: 1, textAlign: 'center' }}>
                                            <Button fullWidth size="small" color="secondary">
                                                View All
                                            </Button>
                                        </Box>
                                    )}
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </Box>
    );
};

export default Notification;
