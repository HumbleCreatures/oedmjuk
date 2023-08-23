import { Button, Container, createStyles, Text, Title, Group } from "@mantine/core";
import { api } from "../../utils/api";
import type { AccessRequest, AccessRequestStep } from "@prisma/client";
import EditorJsRenderer from "../EditorJsRenderer";
import { UserLinkWithData } from "../UserButton";

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
export function RequesterStepAction({step, accessRequest}:{step: AccessRequestStep, accessRequest: AccessRequest}) {
    const {classes} = useStyles();
    const utils = api.useContext();
    const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
        stepId: step.id,
        accessRequestId: accessRequest.id,
    });
    const acceptMutation = api.accessRequest.markRequesterStepAsDone .useMutation({
        onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
        },
      });

    const failedMutation = api.accessRequest.markRequesterStepAsFailure.useMutation({
    onSuccess() {
        void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
    },
    });

    const denyMutation = api.accessRequest.markRequesterStepAsDenied.useMutation({
      onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
      },
      });

    if(stepStatusResult.isLoading) return <div>Loading...</div>;
    if(stepStatusResult.isError) return <div>Error...</div>;

    const {canInteract } = stepStatusResult.data;
    
    return  <Container size="sm" className={classes.area}>
    <Title order={3} className={classes.title}>{step.name}</Title>
    <Text fz="sm" fw={300}>The requesting user, <UserLinkWithData userId={accessRequest.creatorId} />, have to approve this step. </Text>
    <Text fz="sm" fw={300}>{step.description && <EditorJsRenderer data={step.description} />}</Text>
    
    {canInteract && <Group>
    <Button onClick={() => acceptMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id}) }>Verify</Button>
    <Button onClick={() => failedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Failed</Button>
    <Button onClick={() => denyMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Denied</Button>
    </Group>}


    </Container>
}