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
export function OnBehalfOfUserStepAction({step, accessRequest}:{step: AccessRequestStep, accessRequest: AccessRequest}) {
    const {classes} = useStyles();
    const utils = api.useContext();
    const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
        stepId: step.id,
        accessRequestId: accessRequest.id,
    });
    const acceptMutation = api.accessRequest.markOnBehalfOfUserStepAsDone .useMutation({
        onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
        },
      });

    const failedMutation = api.accessRequest.markOnBehalfOfUserStepAsFailure.useMutation({
    onSuccess() {
        void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
    },
    });

    const denyMutation = api.accessRequest.markOnBehalfOfUserStepAsDenied.useMutation({
      onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
      },
      });

    if(stepStatusResult.isLoading) return <div>Loading...</div>;
    if(stepStatusResult.isError) return <div>Error...</div>;
    if(accessRequest.onBehalfOfUserId === null) return (<div>Missing on behalf of user id</div>);

    const {canInteract } = stepStatusResult.data;
    
    return  <Container size="sm" className={classes.area}>
    <Title order={3} className={classes.title}>{step.name}</Title>
    <Text fz="sm" fw={300}>The on behalf of user user, <UserLinkWithData userId={accessRequest.onBehalfOfUserId} />, have to approve this step. </Text>
    <Text fz="sm" fw={300}>{step.description && <EditorJsRenderer data={step.description} />}</Text>
    
    {canInteract && <Group>
    <Button onClick={() => acceptMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id}) }>Verify</Button>
    <Button onClick={() => failedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Failed</Button>
    <Button onClick={() => denyMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Denied</Button>
    </Group>}


    </Container>
}