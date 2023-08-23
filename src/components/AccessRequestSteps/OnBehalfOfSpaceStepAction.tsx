import { Button, Container, createStyles, Text, Title, Group } from "@mantine/core";
import { api } from "../../utils/api";
import type { AccessRequest, AccessRequestStep } from "@prisma/client";
import EditorJsRenderer from "../EditorJsRenderer";
import { SpaceLinkWithData } from "../SpaceButton";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },

  }));
export function OnBehalfOfSpaceStepAction({step, accessRequest}:{step: AccessRequestStep, accessRequest: AccessRequest}) {
    const {classes} = useStyles();
    const utils = api.useContext();
    const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
        stepId: step.id,
        accessRequestId: accessRequest.id,
    });
    const acceptMutation = api.accessRequest.markOnBehalfOfSpaceStepAsDone.useMutation({
        onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
        },
      });

    const failedMutation = api.accessRequest.markOnBehalfOfSpaceStepAsFailure.useMutation({
    onSuccess() {
        void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
    },
    });

    const deniedMutation = api.accessRequest.markOnBehalfOfSpaceStepAsDenied.useMutation({
      onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
      },
      });

    if(stepStatusResult.isLoading) return <div>Loading...</div>;
    if(stepStatusResult.isError) return <div>Error...</div>;
    if(accessRequest.onBehalfOfSpaceId === null) return (<div>Missing space id</div>);

    const {canInteract, hasTakenAction, stepExecutions } = stepStatusResult.data;
    const numberOfVerifications = stepExecutions ? stepExecutions.filter((execution) => execution.done).length : 0;

    return  <Container size="sm" className={classes.area}>
    <Title order={3} className={classes.title}>{step.name}</Title>
    <Text fz="sm" fw={300}>{numberOfVerifications} out of {step.approvalFromOnBehalfOfSpace} members of the space,<SpaceLinkWithData spaceId={accessRequest.onBehalfOfSpaceId} />, has approved the request.</Text>
    <Text fz="sm" fw={300}>{step.description && <EditorJsRenderer data={step.description} />}</Text>
    
    {canInteract && <Group>
    <Button onClick={() => acceptMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id}) }>Verify</Button>
    <Button onClick={() => failedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Failed</Button>
    <Button onClick={() => deniedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Denied</Button>
    </Group>}

    {hasTakenAction && <div>You have already taken action. Thanks!</div>}
    </Container>
}