import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title, createStyles, Group, ThemeIcon, Button } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { DateTime } from "luxon";
import { IconAlignBoxLeftMiddle } from "@tabler/icons";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  bodyArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  mainTitle: {
    color: theme.white,
    fontSize: theme.fontSizes.xxl,
    marginTop: theme.spacing.xl,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  }
}));

function ContentView({ spaceId, itemId }: { spaceId: string; itemId: string }) {
  const { classes } = useStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const contentResult = api.content.getContent.useQuery({ itemId });
  if (spaceResult.isLoading) return <div>loading...</div>;
  if (contentResult.isLoading) return <div>loading...</div>;

  if (!spaceResult.data || !contentResult.data)
    return <div>Could not find content</div>;

  const { space, isMember } = spaceResult.data;
  const {title, createdAt, creatorId, updatedAt} = contentResult.data;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm">
            <Title order={2} className={classes.mainTitle}>{title}</Title>
        </Container>

        <Container size="sm" className={classes.area}>
          
          <Group position="apart">
          <Title order={2} className={classes.areaTitle}>Content</Title>
          <ThemeIcon size="xl">
                  <IconAlignBoxLeftMiddle />
                </ThemeIcon>
                

                
              </Group>
              <div>
                  
                  <Text fz="sm" fw={300}>
                    Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {updatedAt && updatedAt.getTime() !== createdAt.getTime() && <Text fz="sm" fw={300}>
                    Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(updatedAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>}

                  <Text fz="sm">By <Text fz="sm" fw={500} className={classes.inlineText}><UserLinkWithData userId={creatorId} /></Text></Text>
                </div>
                <Link href={`/app/space/${spaceId}/content/${itemId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
        </Container>
        <Container size="sm" className={classes.bodyArea}> 
            <div
              dangerouslySetInnerHTML={{ __html: contentResult.data.body }}
            />
            </Container>

      </Container>
    </AppLayout>
  );
}
const LoadingSpaceView: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return <ContentView spaceId={spaceId as string} itemId={itemId as string} />;
};

export default LoadingSpaceView;
