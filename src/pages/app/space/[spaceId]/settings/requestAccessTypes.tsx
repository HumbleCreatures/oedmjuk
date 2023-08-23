import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Container,
  Title,
  Alert,
  Text,
  createStyles,
  Switch,
  SimpleGrid,
  NumberInput,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { IconAlertCircle } from "@tabler/icons";
import { DynamicBlockEditor } from "../../../../../components/DynamicBlockEditor";
import type { OutputData } from "@editorjs/editorjs";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import Link from "next/link";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import { useRouter } from "next/router";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { useState } from "react";
import { ClearTriggerValues } from "../../../../../components/BlockEditor";
import dynamic from "next/dynamic";

export const DynamicAccessRequestTypeEditor = dynamic(() => import("../../../../../components/AccessRequestTypeEditor"), {
  ssr: false,
})

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  editArea: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  listItemText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
    paddingLeft: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  }
}));

const RequestAccessTypesPage = ({ spaceId }: { spaceId: string }) => {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestTypesResult =
    api.accessRequest.getAllAccessRequestTypesForSpace.useQuery({ spaceId });
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (accessRequestTypesResult.isLoading)
    return <SpaceLoader space={space} isMember={isMember} />;
  if (!accessRequestTypesResult.data)
    return <div>Could not find space request types</div>;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm" className={generalClasses.clearArea}>
          <div className={generalClasses.listHeader}>
            <Title className={classes.areaTitle} order={2}>
              Access Request Types
            </Title>
          </div>
          <SimpleGrid cols={1} spacing="xs">
            {accessRequestTypesResult.data.map((requestType) => {
              return (
                <Link
                  className={generalClasses.listLinkItem}
                  key={requestType.id}
                  href={`/app/space/${spaceId}/settings/accessRequestType/${requestType.id}`}
                >
                  <Text className={classes.listItemText}>
                    {requestType.name}
                  </Text>
                  {requestType.description && (
                    <EditorJsRenderer data={requestType.description} />
                  )}
                </Link>
              );
            })}
          </SimpleGrid>
        </Container>
        <DynamicAccessRequestTypeEditor spaceId={spaceId} />
      </Container>
    </AppLayout>
  );
};

const LoadingRequestAccessTypesPage: NextPage = () => {
  const router = useRouter();

  const { spaceId } = router.query;
  if (!spaceId) return <div>loading...</div>;

  return <RequestAccessTypesPage spaceId={spaceId as string} />;
};

export default LoadingRequestAccessTypesPage;
