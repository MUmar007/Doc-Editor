import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { usePresence } from '../../hooks/usePresence';
import type { User } from '../../types';

const PALETTE = [
  '#F44336', '#2196F3', '#4CAF50', '#FF9800',
  '#9C27B0', '#00BCD4', '#FF5722', '#E91E63',
];

// Matches the backend's deterministic color function exactly
function userColor(userId: string): string {
  const idx = [...userId].reduce((sum, c) => sum + c.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[idx];
}

interface Props {
  docId: string;
  currentUser: User;
}

export function PresenceAvatars({ docId, currentUser }: Props) {
  const others = usePresence(docId);

  // Build the full viewer list: current user first, then others
  const allViewers = [
    { user_id: currentUser.id, display_name: currentUser.display_name, isYou: true },
    ...others.map((u) => ({ ...u, isYou: false })),
  ];

  return (
    <AvatarGroup
      max={5}
      sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11, border: '2px solid #0D1B2A' } }}
    >
      {allViewers.map((u) => (
        <Tooltip
          key={u.user_id}
          title={u.isYou ? 'You' : `${u.display_name} is viewing`}
          arrow
        >
          <Avatar
            sx={{
              bgcolor: userColor(u.user_id),
              width: 28,
              height: 28,
              fontSize: 11,
              outline: u.isYou ? '2px solid #1976D2' : 'none',
            }}
          >
            {u.display_name[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>
      ))}
    </AvatarGroup>
  );
}
