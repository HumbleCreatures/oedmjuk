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
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: 0,
  },
  metaArea: {
    backgroundColor: theme.colors.gray[4],
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  bodyArea: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  mainTitle: {
    color: theme.black,
    fontSize: theme.fontSizes.xxl,
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

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (contentResult.isLoading) return <SpaceLoader space={spaceResult.data?.space} isMember={spaceResult.data?.isMember}/>;

  if (!spaceResult.data || !contentResult.data)
    return <div>Could not find content</div>;

  const { space, isMember } = spaceResult.data;
  const {title, createdAt, creatorId, updatedAt, body} = contentResult.data;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm" className={classes.area}>
          <div className={classes.metaArea}>
          <Group position="apart">
            <Group>
          <ThemeIcon size="xl" color="gray">
                  <IconAlignBoxLeftMiddle />
                </ThemeIcon>
          
          <div >
          <Text fz="sm" fw={500} >Content Page</Text>
                  <Text fz="sm" fw={300} className={classes.inlineText}>
                    {" "} created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {updatedAt && updatedAt.getTime() !== createdAt.getTime() && <Text fz="sm" fw={300} className={classes.inlineText}>
                  {" "} last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(updatedAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>}

                  <Text fz="sm" fw={300} className={classes.inlineText}>{" "} by <Text fz="sm" fw={500} className={classes.inlineText}><UserLinkWithData userId={creatorId} /></Text></Text>
                </div>
          </Group>
          <Link href={`/app/space/${spaceId}/content/${itemId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>

              </Group>

                
            </div>
          <div className={classes.bodyArea}>
          <Title order={2} className={classes.mainTitle}>{title}</Title>
          {body && <EditorJsRenderer data={body} />}
          </div>
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
