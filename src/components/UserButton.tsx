import {
    UnstyledButton,
    UnstyledButtonProps,
    Group,
    Avatar,
    Text,
    createStyles,
  } from '@mantine/core';
  import { IconChevronRight } from '@tabler/icons';
import Link from 'next/link';

  import { api } from "../utils/api";
  
  const useStyles = createStyles((theme) => ({
    user: {
      display: 'block',
      width: '100%',
      padding: theme.spacing.md,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
  
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
      },
    },
  }));
  
  interface UserButtonProps extends UnstyledButtonProps {
    name: string;
    userId: string;
  }

  export function UserButtonWithData ({userId}: {userId: string}) {
    const user = api.user.getUser.useQuery({userId}).data;
    if(!user) return (<div>loading...</div>);
    return <UserButton name={user.name as string} userId={userId} />
  }
  
  export function UserButton({ name, userId }: UserButtonProps) {
    const { classes } = useStyles();
  
    return (
      <Link href={`/app/user/${userId}`}>
      <UnstyledButton className={classes.user} >
        <Group>
          
          <div style={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {name}
            </Text>
          </div>
  
         <IconChevronRight size={14} stroke={1.5} />
        </Group>
      </UnstyledButton></Link>
    );
  }