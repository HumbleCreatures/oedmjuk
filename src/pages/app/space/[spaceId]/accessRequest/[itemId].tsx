import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Timeline, Container, Text, Title, createStyles, Group, ThemeIcon, Button, Badge, List } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { DateTime } from "luxon";
import { IconBox, IconCircleCheck, IconCircleChevronRight, IconCircleDashed, IconCircleX, IconLockAccess, IconUser } from "@tabler/icons";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import { SpaceLinkWithData } from "../../../../../components/SpaceButton";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import { formatDateLengthBetween } from "../../../../../utils/dateFormaters";
import { AccessRequestStates, AccessRequestStepTypes } from "../../../../../utils/enums";
import { ManualStepAction } from "../../../../../components/AccessRequestSteps/ManualStepAction";

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
  timelineWrapper: { 
    marginTop: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
  idText: {
    display: "inline",
    color: theme.colors.earth[5],
  },
}));


function AccessRequestView({ spaceId, itemId }: { spaceId: string; itemId: string }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestResult = api.accessRequest.getAccessRequest.useQuery({ itemId });
  const utils = api.useContext();

  const acceptMutation = api.accessRequest.acceptAccessRequest.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({ itemId });
    },
  });
  const denyMutation = api.accessRequest.denyAccessRequest.useMutation({
    onSuccess() {
      void utils.accessRequest.getAccessRequest.invalidate({ itemId });
    },
  });

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (accessRequestResult.isLoading) return <SpaceLoader space={spaceResult.data?.space} isMember={spaceResult.data?.isMember}/>;

  if (!spaceResult.data || !accessRequestResult.data)
    return <div>Could not find content</div>;

  const { space, isMember } = spaceResult.data;
  const {id, createdAt, creatorId, updatedAt, body, state, onBehalfOfSpaceId, onBehalfOfUserId, accessRequestApproval, stepExecutions} = accessRequestResult.data;
  const { name, steps } = accessRequestResult.data.accessRequestType;
  
  const openSteps = steps.filter((step) => 
  !stepExecutions.some(execution => execution.accessRequestStepId === step.id && execution.stepFinished));
  const nextStep = openSteps[0];
  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={classes.area}>
          <div className={classes.metaArea}>
          <Group position="apart">
            <Group>
          <ThemeIcon size="xl" color="gray">
                  <IconLockAccess />
                </ThemeIcon>
          
          <div >
          <Text fz="sm" fw={500} >Access Request</Text>
                  <Text fz="sm" fw={300} className={classes.inlineText}>
                    {" "} created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {updatedAt && updatedAt.getTime() !== createdAt.getTime() && <Text fz="sm" fw={300}>
                  last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(updatedAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>}

                  <Text fz="sm" fw={300} className={classes.inlineText}>{" "} by <Text fz="sm" fw={500} className={classes.inlineText}><UserLinkWithData userId={creatorId} /></Text></Text>
                </div>
          </Group>
          {state === AccessRequestStates.Created &&<Group position="right" spacing="xs" className={generalClasses.topGroup}>
              
             <Button onClick={() => acceptMutation.mutate({accessRequestId: id})}>
              Accept
            </Button>
            <Button onClick={() => denyMutation.mutate({accessRequestId: id, comment: "No Comment"})}>
              Deny
            </Button> 
            </Group>}

              </Group>

                
            </div>
          <div className={classes.bodyArea}>
          <Group position="apart">
            <Title order={2} className={classes.mainTitle}>Request Type: {name}</Title>
            <Badge>{state}</Badge>
            </Group>
            <Text fz="sm" fw={500} className={classes.idText} >Id: {id}</Text>
            {onBehalfOfSpaceId &&<div><IconBox /> <SpaceLinkWithData spaceId={onBehalfOfSpaceId} /></div> }
            {onBehalfOfUserId &&<div><IconUser /> <UserLinkWithData userId={onBehalfOfUserId} /></div> }
          {body && <EditorJsRenderer data={body} />}
          </div>

          <List
      spacing="xs"
      size="sm"
      center
      icon={
        <ThemeIcon color="gray" size={24} radius="xl">
            <IconCircleDashed size="1rem" />
          </ThemeIcon>
        
      }
    >
      {state === AccessRequestStates.Created && <List.Item>Accept request</List.Item> }
      {(state === AccessRequestStates.Approved || state === AccessRequestStates.Finished) && 
      <List.Item icon={
        <ThemeIcon color="teal" size={24} radius="xl">
        <IconCircleCheck size="1rem" />
      </ThemeIcon>
      }>Accept request</List.Item> }
      {state === AccessRequestStates.Denied && <List.Item icon={
        <ThemeIcon color="red" size={24} radius="xl">
          <IconCircleX size="1rem" /> 
        </ThemeIcon>
      }>Accept request</List.Item> }
      {steps.map((step) => {
      return <List.Item key={step.id}>{step.name}</List.Item>
    })}
      <List.Item
      icon={
        <ThemeIcon color="red" size={24} radius="xl">
          <IconCircleX size="1rem" /> 
        </ThemeIcon>
      }
      >To start development server run npm start command</List.Item>
      <List.Item
      icon={
        <ThemeIcon color="blue" size={24} radius="xl">
          <IconCircleChevronRight size="1rem" /> 
        </ThemeIcon>
      }
      >Run tests to make sure your changes do not break the build</List.Item>
      
      <List.Item
        icon={
          <ThemeIcon color="teal" size={24} radius="xl">
          <IconCircleCheck size="1rem" />
        </ThemeIcon>
        }
      >
        Submit a pull request once you are done
      </List.Item>
    </List>

        </Container>
        
        {nextStep && nextStep.stepType === AccessRequestStepTypes.Manual 
        && <ManualStepAction step={nextStep} accessRequest={accessRequestResult.data} />}
        {nextStep && nextStep.stepType === AccessRequestStepTypes.JoinSpace
        && <Container size="sm" className={classes.area}>
        Current step
        <div>{nextStep?.name}</div>
        <div>{nextStep?.description && <EditorJsRenderer data={nextStep?.description} />}</div>
        </Container> } 
        <Container size="sm" className={classes.area}>
        <Timeline active={1}>
          {accessRequestApproval.map((approval) => {
            return <Timeline.Item key={approval.id} active={true} title="Approval" bulletSize={24}>
            <Text color="dimmed" size="sm">
            {DateTime.fromJSDate(approval.createdAt)
                      .setLocale("en")
                      .toRelative()}: Approved by <UserLinkWithData userId={approval.creatorId} />
            </Text>
          </Timeline.Item>
          })}
        <Timeline.Item active={true} title="Default bullet" bulletSize={24}>
          <Text color="dimmed" size="sm">
            Default bullet without anything
          </Text>
        </Timeline.Item>
        <Timeline.Item active={true} title="Default bullet" bulletSize={24}>
          <Text color="dimmed" size="sm">
            Default bullet without anything
          </Text>
        </Timeline.Item>
        </Timeline>
          </Container>
      </Container>

      
    </AppLayout>
  );
}
const LoadingAccessRequestView: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return <AccessRequestView spaceId={spaceId as string} itemId={itemId as string} />;
};

export default LoadingAccessRequestView;
