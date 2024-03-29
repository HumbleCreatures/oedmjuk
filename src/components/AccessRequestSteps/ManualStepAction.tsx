import { Button, Container, createStyles, Text, Title, Group } from "@mantine/core";
import { api } from "../../utils/api";
import type { AccessRequest, AccessRequestStep } from "@prisma/client";
import EditorJsRenderer from "../EditorJsRenderer";

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
export function ManualStepAction({step, accessRequest}:{step: AccessRequestStep, accessRequest: AccessRequest}) {
    const {classes} = useStyles();
    const utils = api.useContext();
    const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
        stepId: step.id,
        accessRequestId: accessRequest.id,
    });
    const acceptMutation = api.accessRequest.markManualStepAsDone.useMutation({
        onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
        },
      });

    const failedMutation = api.accessRequest.markManualStepAsFailure.useMutation({
    onSuccess() {
        void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
    },
    });

    if(stepStatusResult.isLoading) return <div>Loading...</div>;
    if(stepStatusResult.isError) return <div>Error...</div>;

    const {canInteract, hasTakenAction, stepExecutions } = stepStatusResult.data;
    const numberOfVerifications = stepExecutions ? stepExecutions.filter((execution) => execution.done).length : 0;

    return  <Container size="sm" className={classes.area}>
    <Title order={3} className={classes.title}>{step.name}</Title>
    <Text fz="sm" fw={300}> <Text fz="sm" fw={500} className={classes.inlineText}> {numberOfVerifications} out of {step.manualAction}</Text> has been verified.</Text>
    <Text fz="sm" fw={300}>{step.description && <EditorJsRenderer data={step.description} />}</Text>
    
    {canInteract && <Group>
    <Button onClick={() => acceptMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id}) }>Verify</Button>
    <Button onClick={() => failedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Failed</Button>
    </Group>}

    {hasTakenAction && <div>You have already taken action. Thanks!</div>}
    </Container>
}